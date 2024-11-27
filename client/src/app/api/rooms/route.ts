import { checkUserAuthentication, checkUserRoomAuthorization } from "@/util/auth";
import getMongoClient from "@/util/mongodb";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Message, MessageType } from "@chat-app/types";
import { Prisma, Room, RoomScope } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type UserInRoomSelect = Prisma.UsersInRoomsGetPayload<{
	select: {
		roomId: false;
		auth0Id: true;
		hasLeft: true;
		userInRoomId: true;
		isFavorited: true;
	}
}>;

export type UserDetailedDirectRoom = Room & {
	UsersInRooms: (UserInRoomSelect & {
		user: {
			avatarUrl: string,
			displayName: string
		}
	})[]
} & {
	requestingUserInRoom?: {
		isFavorited: boolean,
		hasLeft: boolean,
	}
} & {
	lastSentMessage?: {
		type: MessageType,
		content: string,
		displayName: string
	}
};

type UserDetailedDirectRoomsSuccess = {
	success: true,
	rooms: UserDetailedDirectRoom[]
}

export type UserDetailedDirectRoomResponse = {
	success: false,
	message: string
} | UserDetailedDirectRoomsSuccess;

const GET = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const rooms: UserDetailedDirectRoom[] = await prisma.room.findMany({
			where: {
				roomScope: {
					in: [RoomScope.DIRECT_MESSAGE, RoomScope.GROUP_CHAT]
				},
				UsersInRooms: {
					some: { // find this user's rooms in which they've not left
						auth0Id: userAuth0Id,
						hasLeft: false
					},
				},
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
				UsersInRooms: { // want an array of the users who are actively in the room with their details
					where: {
						hasLeft: false
					},
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

		const roomsWithRequestingUserInfo: UserDetailedDirectRoom[] = rooms.map((room) => {
			const requestingUserInfoInRoom = room.UsersInRooms.find((room) => room.auth0Id === userAuth0Id);

			if (requestingUserInfoInRoom === undefined) {
				throw Error(`Server error finding userId ${userAuth0Id} on roomId ${room.roomId}}`);
			}

			return ({
				...room,
				requestingUserInRoom: {
					isFavorited: requestingUserInfoInRoom.isFavorited,
					hasLeft: requestingUserInfoInRoom.hasLeft
				}
			});
		});

		const getWithLastMessage = async (rooms: UserDetailedDirectRoom[]) => {
			const withMessage: Promise<UserDetailedDirectRoom>[] = rooms.map(async (room) => {
				const mongo = await getMongoClient();

				const messageCursor = mongo.db("Cluster0").collection("messages").find<Message>(
					{
						room: room.roomId,
					},
					{
						projection: {
							_id: true,
							content: true,
							type: true,
							userId: true
						},
						limit: 1,
						sort: [["time", "desc"]]
					});

				const message = await messageCursor.next();

				if (message === null)
					return room;

				const senderUserInRoom = room.UsersInRooms.find((userInRoom) => userInRoom.auth0Id === message.userId);

				const displayName = senderUserInRoom === undefined ? "*left*" :
					senderUserInRoom.auth0Id === userAuth0Id ? "Me" :
						senderUserInRoom.user.displayName

				return {
					...room,
					lastSentMessage: {
						content: message.content,
						displayName,
						type: message.type,
					}
				};
			});

			const resolved = await Promise.all(withMessage);
			return resolved;
		}

		const roomsUserInfoLastMessage: UserDetailedDirectRoom[] = await getWithLastMessage(roomsWithRequestingUserInfo);

		return NextResponse.json(({ success: true, rooms: roomsUserInfoLastMessage }), { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const patchBodySchema = z.object({
	roomId: z.number().finite().positive(),
	isFavorited: z.boolean()
});

const PATCH = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const { body } = await req.json();

		const parsedBodyParams = patchBodySchema.safeParse(body);
		if (!parsedBodyParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for updating room`, error: parsedBodyParams.error.issues }, { status: 400 });
		}

		const { roomId, isFavorited } = parsedBodyParams.data;

		const authorizationResult = await checkUserRoomAuthorization(userAuth0Id, roomId);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		const patchedUserInRoom = await prisma.usersInRooms.update({
			where: {
				userInRoomId: authorizationResult.userInRoom.userInRoomId
			},
			data: {
				isFavorited
			}
		})

		return NextResponse.json(({ success: true, message: `Successfully patched userInRoom with id ${patchedUserInRoom.userInRoomId}` }), { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
})

export { GET, PATCH };
