import { configDotenv } from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

configDotenv();
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

async function runMongo() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await messagesClient.connect();
		// Send a ping to confirm a successful connection
		await messagesClient.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		await messagesClient.close();
	}
}

/**
 * @param {MongoClient} client 
 * @param {import("@chat-app/types").Message} message 
 * @param {string} username 
 */
const saveMessageToDB = async (client, message) => {
	await client.connect();
	const messageDB = client.db("Cluster0");
	const messageCollection = messageDB.collection("messages");

	await messageCollection.insertOne({ ...message }).then((result) => {
		console.log(`Inserted new message with ID {${result.insertedId}}`);
	}).catch((reason) => {
		console.error(reason);
	});

	await client.close();
}

export { runMongo, saveMessageToDB };
