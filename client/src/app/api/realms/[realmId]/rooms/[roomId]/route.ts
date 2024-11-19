import prisma from "@/util/postgres";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { UsersOnRealmsLevels } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10)),
	roomId: z.string().transform((id) => parseInt(id, 10))
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

		const parsedParams = deleteSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for delete room with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId, roomId } = parsedParams.data;

		// check authorization (must be owner)
		const authorization = await prisma.usersOnRealms.findFirst({
			where: {
				auth0Id: userAuth0Id,
				realmId,
				memberLevel: {
					in: [UsersOnRealmsLevels.ADMIN, UsersOnRealmsLevels.OWNER]
				}
			}
		});

		if (authorization === null) {
			return NextResponse.json({ success: false, message: `Failed to delete room, realm with realmId ${realmId} not found within admin realms of userId ${userAuth0Id}` }, { status: 404 });
		}

		const deletedRoom = await prisma.room.delete({
			where: {
				roomId
			}
		});

		return NextResponse.json({ success: true, message: `Room with roomId ${deletedRoom.roomId} successfully deleted` });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { DELETE };