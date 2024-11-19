import { MongoClient, ServerApiVersion } from "mongodb";

const dbUsername = process.env.MONGO_CLUSTER_ADMIN_USERNAME || "";
const dbPassword = process.env.MONGO_CLUSTER_ADMIN_PASSWORD || "";
const dbPath = process.env.MONGO_CLUSTER_PATH || "";
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbPath}`;

let mongoClient: MongoClient | null = null;

const getMongoClient = async () => {
	if (!mongoClient) {
		mongoClient = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
			tls: true,
		});
		await mongoClient.connect();
	}
	return mongoClient;
};

export default getMongoClient;
