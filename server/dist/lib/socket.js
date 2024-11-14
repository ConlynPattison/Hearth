const leaveRoom = (io, socket, room) => {
    const { userId, userDisplayName } = socket.data;
    const userData = { userId, displayName: userDisplayName, avatarUrl: "" };
    io.to(room).emit("gateway", `${userDisplayName} has left the room.`, userData);
    socket.leave(room);
    console.log(`UserId ${userId} left room: ${room}`);
};
export { leaveRoom };
