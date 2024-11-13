import prisma from "@/util/postgres";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const getSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

const GET = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		// Is the user authenticated?
		const session = await getSession(req, new NextResponse());

		if (!session || !session.user || typeof session.user.sub !== "string") {
			console.error("Failed to get user session data");
			return NextResponse.json({ success: false, message: "Failed to get user session data" }, { status: 401 });
		}
		const userAuth0Id = session.user.sub;

		const parsedParams = getSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for get domains with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		// is user authorized to access this realm's domains?
		const userOnRealm = await prisma.usersOnRealms.findFirst({
			where: {
				realmId,
				auth0Id: userAuth0Id,
			}
		});

		if (userOnRealm === null) {
			return NextResponse.json({ success: false, message: `UserId ${userAuth0Id} not authorized to access realmId ${realmId}` }, { status: 403 })
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
				children: {
					include: {
						DomainPermissions: {
							include: {
								permissions: true
							}
						},
						children: {
							include: {
								DomainPermissions: {
									include: {
										permissions: true
									}
								},
								children: true
							}
						}
					}
				},
			}
		});

		return NextResponse.json({ success: true, domains }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const POST = withApiAuthRequired(async (req: NextRequest) => {

	return NextResponse.json({ success: true }, { status: 200 });
});

export { GET, POST };