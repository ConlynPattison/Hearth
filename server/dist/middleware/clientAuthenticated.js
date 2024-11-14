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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_js_1 = require("../lib/jwt.js");
const clientAuthenticated = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }
    // Verify the token using the dynamically fetched key
    jsonwebtoken_1.default.verify(token, jwt_js_1.getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            console.error(err);
            return next(new Error('Authentication error: Invalid token'));
        }
        // Attach decoded token data to socket
        console.log("Client successfully authenticated with Auth0...");
        socket.data.user = decoded;
        next();
    });
});
exports.clientAuthenticated = clientAuthenticated;
