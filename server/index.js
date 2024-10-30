import { Server, Socket } from "socket.io";
import express from "express";
import { createServer } from "http";
import { configDotenv } from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

configDotenv();
const port = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(",")
	: [];

const io = new Server(httpServer, {
	cors: {
		origin: allowedOrigins,
		allowedHeaders: ["my-custom-header"],
		methods: ["GET", "POST"],
		credentials: true
	}
});

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

async function run() {
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
run().catch(console.dir);

/**
 * 
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

/**
 * 
 * @param {Socket} socket 
 * @param {string} room 
 * @param {string} username 
 */
const leaveRoom = (socket, room) => {
	const { userId, userDisplayName } = socket.data;
	const userData = { userId, displayName: userDisplayName, avatarUrl: "" }
	setTimeout(() => io.to(room).emit(
		"gateway",
		`${userDisplayName} has left the room.`,
		userData
	), 250);
	socket.leave(room);
	console.log(`UserId ${userId} left room: ${room}`);
}

io.on("connection", (socket) => {
	console.log("A user connected");

	// Join a room
	socket.on("joinRoom", (room, userData) => {
		const { userId, displayName } = userData;
		socket.data.userId = userId;
		socket.data.userDisplayName = displayName;
		socket.join(room);
		io.to(room).emit(
			"gateway",
			`${displayName} has joined the room.`,
			userData
		);
		console.log(`UserId ${userId} joined room: ${room}`);
	});

	// Leave a room
	socket.on("leaveRoom", (room, userData) => {
		leaveRoom(socket, room, userData);
	});

	// Send message to a specific room
	socket.on("messageToRoom", (room, message, userData) => {
		const { userId } = userData;
		io.to(room).emit("message", message, userData);
		console.log(`Message sent to room ${room}: ${message}`);

		/** @type {import("@chat-app/types").Message} */
		const messageToSave = {
			type: "text",
			content: message,
			room,
			userId,
			time: Date.now()
		}

		// if (process.env.NODE_ENV == "development")
		saveMessageToDB(messagesClient, messageToSave);
	});

	socket.on("disconnecting", () => {
		const roomsToLeave = Array.from(socket.rooms)?.filter((room) => room !== socket.id)
		roomsToLeave.forEach((room) => {
			leaveRoom(socket, room);
		});
	})

	socket.on("disconnect", () => {
		console.log(`UserId ${socket.data.userId || "unknown user"} disconnected`);
	});
});

httpServer.listen(port);

console.log(`Server running, listening on port: ${port}`);
