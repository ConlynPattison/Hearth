"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKey = void 0;
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
// Configure JWKS client
const jwks = (0, jwks_rsa_1.default)({
    jwksUri: (_a = process.env.AUTH_KEY_PATH) !== null && _a !== void 0 ? _a : "",
    cache: true, // Cache the key for faster future lookups
    rateLimit: true, // Rate limiting to avoid request overload
    jwksRequestsPerMinute: 10, // Adjust rate limit if needed
});
// Helper function to get signing key from JWKS
const getKey = (header, callback) => {
    jwks.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err, undefined);
        }
        const signingKey = key === null || key === void 0 ? void 0 : key.getPublicKey();
        callback(null, signingKey);
    });
};
exports.getKey = getKey;
