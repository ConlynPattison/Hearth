import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const port = process.env.PORT || 4000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		allowedHeaders: ["my-custom-header"],
		credentials: true
	}
});

io.on("connection", (socket) => {
	console.log("A user connected");

	// Join a room
	socket.on("joinRoom", (room, username = "undefined user") => {
		socket.join(room);
		console.log(`User ${username} joined room: ${room}`);
	});

	// Leave a room
	socket.on("leaveRoom", (room) => {
		socket.leave(room);
		console.log(`User left room: ${room}`);
	});

	// Send message to a specific room
	socket.on("messageToRoom", (room, message, user) => {
		io.to(room).emit("message", message, user);
		console.log(`Message sent to room ${room}: ${message}`);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
});

httpServer.listen(port);

console.log(`Server running, listening on port: ${port}`)