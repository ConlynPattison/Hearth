import { Server, Socket } from "socket.io";

/**
 * @param {Server} io
 * @param {Socket} socket 
 * @param {string} room 
 * @param {string} username 
 */
const leaveRoom = (io, socket, room) => {
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

export { leaveRoom };
