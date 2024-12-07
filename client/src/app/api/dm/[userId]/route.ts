import { checkUserAuthentication } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { RoomScope } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createNewDirectMessage, UserDetailedDirectRoom } from "../../rooms/route";

const putQuerySchema = z.object({
	userId: z.string().transform((string) => decodeURIComponent(string))
});

const PUT = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedQueryParams = putQuerySchema.safeParse(params);
		if (!parsedQueryParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for updating direct message room`, error: parsedQueryParams.error.issues }, { status: 400 });
		}

		const { userId } = parsedQueryParams.data;

		const dmRoom: UserDetailedDirectRoom | null = await prisma.room.findFirst({
			where: {
				roomScope: RoomScope.DIRECT_MESSAGE,
				AND: [
					{
						UsersInRooms: {
							some: {
								auth0Id: userAuth0Id
							},
						}
					},
					{
						UsersInRooms: {
							some: {
								auth0Id: userId
							},
						}
					}
				],
			},
			select: {
				roomId: true,
				roomName: true,
				roomScope: true,
				roomType: true,
				roomIconUrl: true,
				roomDescription: true,
				isAgeRestricted: true,
				isPrivate: true,
				realmId: true,
				domainId: true,
				UsersInRooms: {
					select: {
						user: {
							select: {
								avatarUrl: true,
								displayName: true
							}
						},
						isFavorited: true,
						hasLeft: true,
						auth0Id: true,
						userInRoomId: true
					},
				},
			}
		});

		// yes? => respond with that DM room's id
		if (dmRoom !== null) {
			const rejoinedRoom = await prisma.usersInRooms.update({
				where: {
					auth0Id_roomId: {
						auth0Id: userAuth0Id,
						roomId: dmRoom.roomId
					}
				},
				data: {
					hasLeft: false
				}
			})
			return NextResponse.json({ roomId: dmRoom.roomId, detailedRoom: rejoinedRoom, message: `Found existing DM room of id ${dmRoom.roomId} with user ${userId}` }, { status: 200 });
		}

		// no? => create that DM room and subsequent entities, respond with that DM room's id
		const createdDMroom = await createNewDirectMessage(userId, userAuth0Id, false);
		if (!createdDMroom.success) {
			return NextResponse.json({ message: createdDMroom.message }, { status: 400 });
		}

		return NextResponse.json({ roomId: createdDMroom.roomId, detailedRoom: createdDMroom.detailedRoom, message: createdDMroom.message }, { status: 201 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { PUT };