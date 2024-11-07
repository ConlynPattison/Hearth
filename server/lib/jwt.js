import jwksClient from "jwks-rsa";

// Configure JWKS client
const jwks = jwksClient({
	jwksUri: process.env.AUTH_KEY_PATH,
	cache: true, // Cache the key for faster future lookups
	rateLimit: true, // Rate limiting to avoid request overload
	jwksRequestsPerMinute: 10, // Adjust rate limit if needed
});

// Helper function to get signing key from JWKS
const getKey = (header, callback) => {
	jwks.getSigningKey(header.kid, (err, key) => {
		if (err) {
			return callback(err);
		}
		const signingKey = key.getPublicKey();
		callback(null, signingKey);
	});
};

export { getKey };
