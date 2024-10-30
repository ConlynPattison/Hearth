import mongo from "@/util/mongodb";
import prisma from "@/util/postgres";
import { Message, MessageForView } from "@chat-app/types";

type BaseUserData = {
	auth0Id: string,
	displayName: string,
	avatarUrl: string,
};

type UserMap = {
	[userId: string]: BaseUserData
};

export const GET = async (
	request: Request,
	{ params }: { params: { room: string } }
) => {
	/**
	 * In the future, this would be the case where we could use Redis
	 * -> rather than fetching all of the messages, fetch only the ones that are newest from
	 * the most recently cached Redis message (if there is not a new message, only use the cache)
	 */
	const { room } = params;

	const messagesClient = await mongo.connect();

	const messagesCollection = messagesClient.db("Cluster0").collection("messages");
	const cursor = messagesCollection.find<Message>(
		{
			room: room
		},
		{
			projection: {
				_id: 0,
				userId: 1,
				time: 1,
				room: 1,
				content: 1
			}
		});

	const messages: Message[] = [];
	for await (const message of cursor) {
		messages.push(message);
	}

	await messagesClient.close();

	if (messages.length === 0) {
		return Response.json([]);
	}

	const userIds = new Set(messages.map(message => message.userId));

	await prisma.$connect();
	const users: BaseUserData[] = await prisma.user.findMany({
		where: {
			auth0Id: {
				in: Array.from(userIds)
			}
		},
		select: {
			auth0Id: true,
			avatarUrl: true,
			displayName: true
		}
	});

	const userToData = users.reduce((acc, user) => {
		acc[user.auth0Id] = user;
		return acc;
	}, {} as UserMap);

	const messagesWithUser: MessageForView[] = messages.map((msg: Message) => {
		return ({
			...msg,
			displayName: userToData[msg.userId]?.displayName ?? "Unknown User",
			avatarUrl: userToData[msg.userId]?.avatarUrl ?? ""
		});
	});

	return Response.json(messagesWithUser);
}