import { checkUserAuthentication, checkUserRoomAuthorization } from "@/util/auth";
import getMongoClient from "@/util/mongodb";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Message, MessageType } from "@chat-app/types";
import { Prisma, Room, RoomScope, RoomType } from "@prisma/client";
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

const postBodySchema = z.object({
	// Room Information
	roomName: z.string().optional(),
	roomScope: z.nativeEnum(RoomScope),
	roomIconUrl: z.string().optional(),
	roomDescription: z.string().optional(),
	isAgeRestricted: z.boolean(),

	// User(s) information
	userIds: z.array(z.string()).or(z.string())
});

type CreateNewPrivateChatResult = {
	success: true,
	roomId: number,
	message: string,
	detailedRoom: UserDetailedDirectRoom
} | {
	success: false,
	message: string
}

export const createNewDirectMessage = async (
	userId: string,
	requestingUserId: string,
	safe = true
): Promise<CreateNewPrivateChatResult> => {
	// check if there exists a DM between these two users already, if so, cancel the create
	const roomTransactionResult: {
		success: false;
		message: string;
	} | {
		success: true;
		roomId: number;
		detailedRoom: UserDetailedDirectRoom;
	} | undefined
		= await prisma.$transaction(async (prisma) => {
			if (safe) {
				const existingRoom = await prisma.room.findFirst({
					where: {
						// Search for a DM room
						roomScope: RoomScope.DIRECT_MESSAGE,
						// Which holds both users (logged-in/requesting and invited user)
						AND: [
							{
								UsersInRooms: {
									some: {
										auth0Id: requestingUserId
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
						]
					},
				});

				if (existingRoom) {
					return {
						success: false,
						message: `Failed to create DM room, room already exists between users ${requestingUserId} and ${userId}`
					}
				}
			}
			// else, create the room, and both UsersInRooms entities
			const newDM = await prisma.room.create({
				data: {
					roomScope: RoomScope.DIRECT_MESSAGE,
					roomType: RoomType.TEXT,
					isPrivate: true,
					isAgeRestricted: false,
				}
			});

			const usersInDMdata = [
				{
					roomId: newDM.roomId,
					auth0Id: requestingUserId,
					hasLeft: false,
					isFavorited: false
				},
				{
					roomId: newDM.roomId,
					auth0Id: userId,
					hasLeft: false,
					isFavorited: false
				}
			];

			const usersInDM = await Promise.all(usersInDMdata.map(
				(userInDMinstance) => prisma.usersInRooms.create({
					data: userInDMinstance,
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
				})
			));

			if (usersInDM.length === 2) {
				const detailedRoom: UserDetailedDirectRoom = {
					...newDM,
					UsersInRooms: usersInDM,
					requestingUserInRoom: {
						isFavorited: false,
						hasLeft: false
					}
				}

				return {
					success: true,
					roomId: newDM.roomId,
					detailedRoom
				}
			}
		});

	if (!roomTransactionResult || !roomTransactionResult.success) {
		return {
			success: false,
			message: roomTransactionResult ? roomTransactionResult.message : "Failure to create DM",
		}
	}

	return {
		success: true,
		message: `Successfully created new DM room of id ${roomTransactionResult.roomId} between users ${requestingUserId} and ${userId}`,
		roomId: roomTransactionResult.roomId,
		detailedRoom: roomTransactionResult.detailedRoom
	}
}

const createNewGroupMessage = async (
	roomDescription: string | undefined,
	userIds: string[],
	requestingUserId: string,
	roomIconUrl: string | undefined,
	roomName: string | undefined,
	isAgeRestricted: boolean
): Promise<CreateNewPrivateChatResult> => {
	// check if there exists a DM between these two users already, if so, cancel the create
	const roomTransactionResult: {
		success: false;
		message: string;
	} | {
		success: true;
		roomId: number;
		detailedRoom: UserDetailedDirectRoom;
	} | undefined
		= await prisma.$transaction(async (prisma) => {
			const newGroupChat = await prisma.room.create({
				data: {
					roomScope: RoomScope.GROUP_CHAT,
					roomType: RoomType.TEXT,
					isPrivate: true,
					isAgeRestricted,
					roomName,
					roomDescription,
					roomIconUrl
				}
			});

			const usersInGroupChat = await Promise.all([...userIds, requestingUserId].map(
				(userId) => prisma.usersInRooms.create({
					data: {
						roomId: newGroupChat.roomId,
						auth0Id: userId,
						hasLeft: false,
						isFavorited: false,
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
				})
			));

			if (usersInGroupChat.length === userIds.length + 1) {
				const detailedRoom: UserDetailedDirectRoom = {
					...newGroupChat,
					UsersInRooms: usersInGroupChat,
					requestingUserInRoom: {
						isFavorited: false,
						hasLeft: false
					}
				}

				return {
					success: true,
					roomId: newGroupChat.roomId,
					detailedRoom
				}
			}

			else throw new Error(`Closing create Group Chat transaction, invalid count of users found, expected ${userIds.length + 1} found ${usersInGroupChat.length}`);
		});

	if (!roomTransactionResult || !roomTransactionResult.success) {
		return {
			success: false,
			message: roomTransactionResult ?? "Failure to create Group Chat",
		}
	}

	return {
		success: true,
		message: `Successfully created new Group Chat room of id ${roomTransactionResult.roomId} between `,
		roomId: roomTransactionResult.roomId,
		detailedRoom: roomTransactionResult.detailedRoom
	}
}

const POST = withApiAuthRequired(async (req: NextRequest) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const { body } = await req.json();

		const parsedBodyParams = postBodySchema.safeParse(body);
		if (!parsedBodyParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for creating room`, error: parsedBodyParams.error.issues }, { status: 400 });
		}

		const {
			roomName,
			roomScope,
			roomIconUrl,
			roomDescription,
			isAgeRestricted,
			userIds
		} = parsedBodyParams.data;

		if (roomScope === RoomScope.DIRECT_MESSAGE && !Array.isArray(userIds)) {
			const createDMresponse = await createNewDirectMessage(userIds, userAuth0Id);

			if (!createDMresponse.success) {
				return NextResponse.json({ success: false, message: createDMresponse.message }, { status: 400 })
			}

			return NextResponse.json({ success: true, message: createDMresponse.message, roomId: createDMresponse.roomId }, { status: 201 });
		}

		if (roomScope === RoomScope.GROUP_CHAT && Array.isArray(userIds)) {
			const createGroupChatResponse = await createNewGroupMessage(roomDescription, userIds, userAuth0Id, roomIconUrl, roomName, isAgeRestricted);

			if (!createGroupChatResponse.success) {
				return NextResponse.json({ success: false, message: createGroupChatResponse.message }, { status: 400 });
			}

			return NextResponse.json({ success: true, message: createGroupChatResponse.message, roomId: createGroupChatResponse.roomId }, { status: 201 })
		}

		return NextResponse.json({ success: false, message: `Invalid argument values provided for creation of Direct Message or Group Chat` }, { status: 400 });
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
		});

		return NextResponse.json(({ success: true, message: `Successfully patched userInRoom with id ${patchedUserInRoom.userInRoomId}` }), { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { GET, PATCH, POST };
