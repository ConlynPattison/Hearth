/* eslint-disable no-var */
import { MongoClient } from "mongodb";

// Extend the globalThis object to include _mongoClient
declare global {
	var _mongoClient: MongoClient | undefined;
}

export { };