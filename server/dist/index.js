import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { configDotenv } from "dotenv";
import { saveMessageToDB, runMongo } from "./lib/mongo.js";
import { clientAuthenticated } from "./middleware/clientAuthenticated.js";
import { runPrisma } from "./lib/postgres.js";
import { leaveRoom } from "./lib/socket.js";
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
io.use(clientAuthenticated);
io.on("connection", (socket) => {
    console.log("A user connected");
    // Join a room
    socket.on("joinRoom", (room, userData) => {
        const { userId, displayName } = userData;
        socket.data.userId = userId;
        socket.data.userDisplayName = displayName;
        socket.join(room);
        io.to(room).emit("gateway", `${displayName} has joined the room.`, userData);
        console.log(`UserId ${userId} joined room: ${room}`);
    });
    // Leave a room
    socket.on("leaveRoom", (room) => {
        leaveRoom(io, socket, room);
    });
    // Send message to a specific room
    socket.on("messageToRoom", (room, message, userData) => {
        const { userId } = userData;
        io.to(room).emit("message", message, userData);
        console.log(`Message sent to room ${room}: ${message}`);
        const messageToSave = {
            type: "text",
            content: message,
            room,
            userId,
            time: Date.now()
        };
        // if (process.env.NODE_ENV == "development")
        saveMessageToDB(messageToSave);
    });
    socket.on("disconnecting", () => {
        const roomsToLeave = Array.from(socket.rooms)?.filter((room) => room !== socket.id);
        if (roomsToLeave) {
            roomsToLeave.forEach((room) => {
                leaveRoom(io, socket, room);
            });
        }
    });
    socket.on("disconnect", () => {
        console.log(`UserId ${socket.data.userId || "unknown user"} disconnected`);
    });
});
runMongo().catch(console.dir);
runPrisma().catch(console.dir);
httpServer.listen(port);
console.log(`Server running, listening on port: ${port}`);
