import jwt from "jsonwebtoken";
import { getKey } from "../lib/jwt.js";
export const clientAuthenticated = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }
    // Verify the token using the dynamically fetched key
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            console.error(err);
            return next(new Error('Authentication error: Invalid token'));
        }
        // Attach decoded token data to socket
        console.log("Client successfully authenticated with Auth0...");
        socket.data.user = decoded;
        next();
    });
};
