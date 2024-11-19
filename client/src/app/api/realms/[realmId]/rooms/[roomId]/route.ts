import { ADMIN_LEVELS, checkUserAuthentication, checkUserRealmAuthorization } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10)),
	roomId: z.string().transform((id) => parseInt(id, 10))
});

const DELETE = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedParams = deleteSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for delete room with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId, roomId } = parsedParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
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