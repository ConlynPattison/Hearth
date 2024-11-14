"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRoom = void 0;
const leaveRoom = (io, socket, room) => {
    const { userId, userDisplayName } = socket.data;
    const userData = { userId, displayName: userDisplayName, avatarUrl: "" };
    io.to(room).emit("gateway", `${userDisplayName} has left the room.`, userData);
    socket.leave(room);
    console.log(`UserId ${userId} left room: ${room}`);
};
exports.leaveRoom = leaveRoom;
