import { MongoClient, ServerApiVersion } from "mongodb";

const dbUsername = process.env.MONGO_CLUSTER_ADMIN_USERNAME || "";
const dbPassword = process.env.MONGO_CLUSTER_ADMIN_PASSWORD || "";
const dbPath = process.env.MONGO_CLUSTER_PATH || "";
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbPath}`;

const mongoClientSingleton = () => {
	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	return new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
		tls: true
	});
}
declare const globalThis: {
	mongoGlobal: ReturnType<typeof mongoClientSingleton>;
} & typeof global;

const mongo = globalThis.mongoGlobal ?? mongoClientSingleton();

export default mongo;

if (process.env.NODE_ENV !== "production") globalThis.mongoGlobal = mongo;