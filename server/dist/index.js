"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const dotenv_1 = require("dotenv");
const mongo_1 = require("./lib/mongo");
const socket_1 = require("./lib/socket");
const clientAuthenticated_1 = require("./middleware/clientAuthenticated");
const postgres_1 = require("./lib/postgres");
(0, dotenv_1.configDotenv)();
const port = process.env.PORT || 4000;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [];
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        allowedHeaders: ["my-custom-header"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.use(clientAuthenticated_1.clientAuthenticated);
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
        (0, socket_1.leaveRoom)(io, socket, room);
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
            time: Date.now().toString()
        };
        // if (process.env.NODE_ENV == "development")
        (0, mongo_1.saveMessageToDB)(messageToSave);
    });
    socket.on("disconnecting", () => {
        var _a;
        const roomsToLeave = (_a = Array.from(socket.rooms)) === null || _a === void 0 ? void 0 : _a.filter((room) => room !== socket.id);
        if (roomsToLeave) {
            roomsToLeave.forEach((room) => {
                (0, socket_1.leaveRoom)(io, socket, room);
            });
        }
    });
    socket.on("disconnect", () => {
        console.log(`UserId ${socket.data.userId || "unknown user"} disconnected`);
    });
});
(0, mongo_1.runMongo)().catch(console.dir);
(0, postgres_1.runPrisma)().catch(console.dir);
httpServer.listen(port);
console.log(`Server running, listening on port: ${port}`);
