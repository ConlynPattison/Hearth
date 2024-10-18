import { Message } from "@chat-app/types";
import { MongoClient, ServerApiVersion } from "mongodb";

const dbUsername = process.env.MONGO_CLUSTER_ADMIN_USERNAME || "";
const dbPassword = process.env.MONGO_CLUSTER_ADMIN_PASSWORD || "";
const dbPath = process.env.MONGO_CLUSTER_PATH || "";
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbPath}`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const messagesClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
	tls: true
});

export async function GET(
	request: Request,
	{ params }: { params: { room: string } }
) {
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

	/**
	 * At this point, I need to connect to the MongoDB instance and
	 * fetch any messages found in this room (should be limiting to some number, may want
	 * to delete any messages that don't have a timestamp and add an index for date and room)
	 * 
	 * Get these messages and send them to the client side through a fetch call
	 * 
	 * Render these now fetched messages by adding them as the default values in the state for Messages[]
	 * 
	 * In the future, this would be the case where we could use Redis
	 * -> rather than fetching all of the messages, fetch only the ones that are newest from
	 * the most recently cached Redis message (if there is not a new message, only use the cache)
	 */
}