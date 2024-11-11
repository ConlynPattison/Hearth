import prisma from "@/util/postgres";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { UsersOnRealmsLevels } from "@prisma/client";
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
			return NextResponse.json({ success: false, message: `Invalid arguments for get realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		// Fetch and send the realm data
		await prisma.$connect();
		const realm = await prisma.realm.findFirst({
			where: {
				UsersOnRealms: {
					some: {
						auth0Id: userAuth0Id,
						realmId: realmId
					}
				}
			},
			include: {
				UsersOnRealms: {
					where: {
						auth0Id: userAuth0Id
					}
				}
			}
		});
		await prisma.$disconnect();

		if (realm === null) {
			return NextResponse.json({ success: false, message: `Realm with realmId ${realmId} not found within realms of userId ${userAuth0Id}` }, { status: 404 });
		}

		return NextResponse.json({ success: true, realm }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const DELETE = withApiAuthRequired(async (req: NextRequest, { params }) => {
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
			return NextResponse.json({ success: false, message: `Invalid arguments for get realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		// check authorization (must be owner)
		await prisma.$connect();
		const realm = await prisma.usersOnRealms.findFirst({
			where: {
				auth0Id: userAuth0Id,
				realmId,
				memberLevel: UsersOnRealmsLevels.OWNER
			}
		});
		await prisma.$disconnect();

		if (realm === null) {
			return NextResponse.json({ success: false, message: `Realm with realmId ${realmId} not found within realms of userId ${userAuth0Id}` }, { status: 404 });
		}

		// Fetch and send the realm data
		await prisma.$connect();
		const deletedRealm = await prisma.realm.delete({
			where: {
				realmId
			}
		});
		await prisma.$disconnect();

		return NextResponse.json({ success: true, message: `Realm with realmId ${deletedRealm.realmId} successfully deleted` });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { GET, DELETE };