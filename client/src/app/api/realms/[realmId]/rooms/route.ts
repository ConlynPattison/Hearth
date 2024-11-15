import prisma from "@/util/postgres";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { RoomScope, RoomType, UsersOnRealmsLevels } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
	domainId: z.number().finite().positive().nullable(), // optionally null for root-level creates
	isPrivate: z.boolean(),
	roomName: z.string().min(1).max(32),
	roomScope: z.nativeEnum(RoomScope),
	roomType: z.nativeEnum(RoomType),
	roomIconUrl: z.string().nullable(),
	roomDescription: z.string().min(1).max(256).nullable(),
	isAgeRestricted: z.boolean()
});

const postQuerySchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

/**
 * Create a room within a realm (with or without a parent domain) 
*/
const POST = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		// Is the user authenticated?
		const session = await getSession(req, new NextResponse());

		if (!session || !session.user || typeof session.user.sub !== "string") {
			console.error("Failed to get user session data");
			return NextResponse.json({ success: false, message: "Failed to get user session data" }, { status: 401 });
		}
		const userAuth0Id = session.user.sub;

		const parsedQueryParams = postQuerySchema.safeParse(params);
		if (!parsedQueryParams.success) {
			return NextResponse.json({ success: false, message: `Invalid query arguments for create room with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedQueryParams.data;

		const { body } = await req.json();

		const parsedBody = postBodySchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json({ success: false, message: `Invalid body arguments for create room with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const {
			domainId,
			isPrivate,
			roomName,
			roomScope,
			roomType,
			roomIconUrl,
			roomDescription,
			isAgeRestricted,
		} = parsedBody.data;

		if (roomScope !== RoomScope.REALM) {
			return NextResponse.json({ success: false, message: `Room creation within realm requires RoomType value of "REALM", received ${roomType}` }, { status: 400 })
		}

		// is user authorized to make changes to this realm?
		const userOnRealm = await prisma.usersOnRealms.findFirst({
			where: {
				auth0Id: userAuth0Id,
				realmId,
				memberLevel: {
					in: [UsersOnRealmsLevels.ADMIN, UsersOnRealmsLevels.OWNER]
				}
			}
		});

		if (userOnRealm === null) {
			return NextResponse.json({ success: false, message: `UserId ${userAuth0Id} not authorized to create rooms on realmId ${realmId}` }, { status: 403 })
		}

		// is the domainId present? if so, is it on this realm?
		if (domainId !== null) {
			const domain = await prisma.domain.findFirst({
				where: {
					domainId,
					realmId
				}
			});

			if (domain === null) {
				return NextResponse.json({ success: false, message: `DomainId ${domainId} does not exist on realmId ${realmId} for room creation` }, { status: 404 })
			}
		}

		const room = await prisma.room.create({
			data: {
				realmId,
				domainId,
				isPrivate,
				roomName,
				roomScope,
				roomType,
				roomIconUrl,
				roomDescription,
				isAgeRestricted,
			}
		})

		return NextResponse.json({ success: true, message: `Successfully created room of roomId ${room.roomId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { POST };
