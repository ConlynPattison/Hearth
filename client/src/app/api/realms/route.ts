import { ADMIN_LEVELS, checkUserAuthentication, checkUserRealmAuthorization } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { UsersOnRealmsLevels } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GET = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		// Fetch and send the realm data []
		const realms = await prisma.realm.findMany({
			where: {
				UsersOnRealms: {
					some: {
						auth0Id: userAuth0Id
					}
				}
			},
			include: {
				UsersOnRealms: {
					where: {
						auth0Id: userAuth0Id
					},
				}
			}
		});

		return NextResponse.json({ success: true, realms }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const postSchema = z.object({
	realmName: z.string().min(1).max(16),
	isSearchable: z.boolean().optional(),
});

const POST = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const { body } = await req.json();
		const params = postSchema.safeParse(body);
		if (!params.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for create realm with error: ${params.error}` }, { status: 400 });
		}

		const { realmName, isSearchable } = params.data;

		const realm = await prisma.$transaction(async (prisma) => {
			const realm = await prisma.realm.create({
				data: {
					realmName,
					isSearchable: isSearchable === undefined ? true : isSearchable
				}
			});
			await prisma.usersOnRealms.create({
				data: {
					auth0Id: userAuth0Id,
					realmId: realm.realmId,
					memberLevel: UsersOnRealmsLevels.OWNER
				}
			});
			return realm;
		});
		return NextResponse.json({ success: true, message: `Successfully created realm with realmId: ${realm.realmId}` }, { status: 201 });

	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const patchSchema = z.object({
	realmId: z.number().int().positive().finite(),
	realmName: z.string().max(16).min(1),
	isSearchable: z.boolean()
});

const PATCH = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		// are arguments valid?
		const { body } = await req.json();

		const params = patchSchema.safeParse(body);
		if (!params.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for create realm with error: ${params.error}` }, { status: 400 });
		}

		const { realmId, realmName, isSearchable } = params.data;

		// is user authorized to make this patch? => (owner or admin of realm)
		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);

		if (!authorizationResult.authorized) {
			return NextResponse.json({ sucess: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		// perform the update TODO: consider the addition of a "updatedAt"
		const patchedRealm = await prisma.realm.update({
			where: {
				realmId
			},
			data: {
				realmName,
				isSearchable
			}
		});

		return NextResponse.json({ success: true, message: `Successfully updated realm with realmId: ${patchedRealm.realmId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { GET, POST, PATCH };
