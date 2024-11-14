"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessageToDB = exports.runMongo = void 0;
const dotenv_1 = require("dotenv");
const mongodb_1 = require("mongodb");
(0, dotenv_1.configDotenv)();
const dbUsername = process.env.MONGO_CLUSTER_ADMIN_USERNAME || "";
const dbPassword = process.env.MONGO_CLUSTER_ADMIN_PASSWORD || "";
const dbPath = process.env.MONGO_CLUSTER_PATH || "";
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbPath}`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const messagesClient = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: true
});
const runMongo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        yield messagesClient.connect();
        // Send a ping to confirm a successful connection
        yield messagesClient.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        yield messagesClient.close();
    }
});
exports.runMongo = runMongo;
const saveMessageToDB = (message) => __awaiter(void 0, void 0, void 0, function* () {
    yield messagesClient.connect();
    const messageDB = messagesClient.db("Cluster0");
    const messageCollection = messageDB.collection("messages");
    yield messageCollection.insertOne(Object.assign({}, message)).then((result) => {
        console.log(`Inserted new message with ID {${result.insertedId}}`);
    }).catch((reason) => {
        console.error(reason);
    });
    yield messagesClient.close();
});
exports.saveMessageToDB = saveMessageToDB;
