import { ADMIN_LEVELS, checkUserAuthentication, checkUserRealmAuthorization, MEMBER_LEVELS } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { RoomScope } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_DOMAIN_DEPTH = 3;

const getSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

const GET = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);

		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedParams = getSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for get domains with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, MEMBER_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status })
		}

		// TODO: in query or with post-query logic, remove domains that the user cannot access
		// fetches depth of three (max) for domains found in a realm from each root domain
		const domains = await prisma.domain.findMany({
			where: {
				realmId,
				parentDomainId: null
			},
			include: {
				DomainPermissions: {
					include: {
						permissions: true
					}
				},
				Room: true,
				children: {
					include: {
						DomainPermissions: {
							include: {
								permissions: true
							}
						},
						Room: true,
						children: {
							include: {
								DomainPermissions: {
									include: {
										permissions: true
									}
								},
								Room: true,
								children: true
							}
						}
					}
				},
			}
		});

		const rooms = await prisma.room.findMany({
			where: {
				realmId,
				domainId: null,
				roomScope: RoomScope.REALM
			}
		})

		return NextResponse.json({ success: true, domains, rooms }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const postBodySchema = z.object({
	domainName: z.string().max(16).min(1),
	parentDomainId: z.number().finite().positive().nullable(),
	isPrivate: z.boolean()
})

const postQuerySchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

type DepthTestDomain = {
	domainId: number,
	parentDomainId: number | null,
	parentDomain: DepthTestDomain | null
} | null

const POST = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);

		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedParams = postQuerySchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid query arguments for create domain with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		const { body } = await req.json();
		const parsedBody = postBodySchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json({ success: false, message: `Invalid body arguments for create domain with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { domainName, parentDomainId, isPrivate } = parsedBody.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		// Is this depth a valid level to append a domain to?
		if (parentDomainId) {
			// starting selection from the parent that was provided (depth beginning at 1)
			const testDepthDomain = await prisma.domain.findFirst({
				where: {
					domainId: parentDomainId,
					realmId
				},
				select: {
					domainId: true, // depth 1 => original parent is of depth 1
					parentDomainId: true,
					parentDomain: {
						select: {
							domainId: true, // depth 2
							parentDomainId: true,
							parentDomain: {
								select: {
									domainId: true, // depth 3 (max) => original parent is at the max depth of 3 (cannot add another)
									parentDomainId: true,
									parentDomain: true
								}
							}
						}
					}
				}
			});

			if (testDepthDomain === null) {
				return NextResponse.json({ success: false, message: `ParentDomainId ${parentDomainId} could not be found on realmId ${realmId}` }, { status: 404 })
			}

			let currentDepth = 1;
			let currentDomain: DepthTestDomain = testDepthDomain.parentDomain as DepthTestDomain;

			while (currentDomain) {
				currentDomain = currentDomain.parentDomain;
				currentDepth += 1;
				if (currentDepth >= MAX_DOMAIN_DEPTH) break;
			}

			if (currentDepth >= MAX_DOMAIN_DEPTH) {
				return NextResponse.json({ success: false, message: `ParentDomainId ${parentDomainId} is at or beyond the max depth for sub-domain allocation. Current depth: ${currentDepth}, max depth: ${MAX_DOMAIN_DEPTH}` }, { status: 404 })
			}
		}

		const domain = await prisma.domain.create({
			data: {
				realmId,
				domainName,
				parentDomainId,
				isPrivate
			}
		});

		return NextResponse.json({ success: true, message: `Successfully created domain of domainId ${domain.domainId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const patchBodySchema = z.object({
	domainName: z.string().max(16).min(1),
	parentDomainId: z.number().finite().positive().nullable(),
	domainId: z.number().finite().positive(),
	isPrivate: z.boolean()
});

const patchQuerySchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10)),
})

/**
 * @notes Current behavior moves all children of updated domain to the original parent of the updated domain.
 * This could be changed to allow for tree-segments to be moved entirely IF the logic for knowing when a move
 * is valid were implemented.
 */
const PATCH = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);

		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		// are arguments valid?
		const { body } = await req.json();

		const parsedBodyParam = patchBodySchema.safeParse(body);
		if (!parsedBodyParam.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for update realm with error: ${parsedBodyParam.error}` }, { status: 400 });
		}

		const { domainName, domainId, parentDomainId, isPrivate } = parsedBodyParam.data;

		const parsedQueryParams = patchQuerySchema.safeParse(params);
		if (!parsedQueryParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for update realm with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedQueryParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		await prisma.$transaction(async (prisma) => {
			const originalDomain = await prisma.domain.findFirst({
				where: {
					domainId
				}
			});

			await prisma.domain.updateMany({
				where: {
					parentDomainId: originalDomain?.domainId
				},
				data: {
					parentDomainId: originalDomain?.parentDomainId
				}
			});
		});

		// perform the update TODO: consider the addition of a "updatedAt"
		const updatedDomain = await prisma.domain.update({
			where: {
				realmId,
				domainId
			},
			data: {
				parentDomainId,
				domainName,
				isPrivate
			}
		});

		return NextResponse.json({ success: true, message: `Successfully updated realm with domainId: ${updatedDomain.domainId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { GET, POST, PATCH };