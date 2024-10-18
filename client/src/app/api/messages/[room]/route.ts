import { messagesClient } from "@/util/mongodb";
import { Message } from "@chat-app/types";

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

	await messagesClient.connect();

	const messagesCollection = messagesClient.db("Cluster0").collection("messages");
	const cursor = messagesCollection.find<Message>(
		{
			room: room
		},
		{
			projection: {
				_id: 0,
				user: 1,
				time: 1,
				room: 1,
				content: 1
			}
		});

	const messages: Message[] = [];
	for await (const message of cursor) {
		messages.push(message);
	}

	messagesClient.close();

	return Response.json(messages);
}