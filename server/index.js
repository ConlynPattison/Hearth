import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { configDotenv } from "dotenv";

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

const leaveRoom = (socket, room, username) => {
	setTimeout(() => io.to(room).emit(
		"gateway",
		`${username} has left the room.`
	), 500);
	socket.leave(room);
	console.log(`User ${username} left room: ${room}`);
}

io.on("connection", (socket) => {
	console.log("A user connected");

	// Join a room
	socket.on("joinRoom", (room, username = "undefined user") => {
		socket.data.username = username
		socket.join(room);
		io.to(room).emit(
			"gateway",
			`${username} has joined the room.`
		);
		console.log(`User ${username} joined room: ${room}`);
	});

	// Leave a room
	socket.on("leaveRoom", (room, username) => {
		leaveRoom(socket, room, username);
	});

	// Send message to a specific room
	socket.on("messageToRoom", (room, message, user) => {
		io.to(room).emit("message", message, user);
		console.log(`Message sent to room ${room}: ${message}`);
	});

	socket.on("disconnecting", () => {
		const username = socket.data.username || "Unknown User";
		const roomsToLeave = socket.rooms?.filter((room) => room !== socket.id)
		roomsToLeave.forEach((room) => {
			leaveRoom(socket, room, username);
		});
	})

	socket.on("disconnect", () => {
		console.log(`User ${socket.data.username || "unknown user"} disconnected`);
	});
});

httpServer.listen(port);

console.log(`Server running, listening on port: ${port}`);
