import axios from "axios";

type PostAuthPayload = {
	access_token: string,
	token_type: string,
	expires_in: number
}

const fetchToken = async () => {
	const options = {
		method: 'POST',
		url: `${process.env.AUTH0_ISSUER_BASE_URL || ""}/oauth/token`,
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: process.env.AUTH0_CLIENT_ID || "",
			client_secret: process.env.AUTH0_CLIENT_SECRET || "",
			audience: "chat-authenticate"
		})
	};

	const data = await axios.request<PostAuthPayload>(options).then(function (response) {
		return response.data;
	}).catch(function (error) {
		console.error(error);
		return null;
	});
	return data;
}

export { fetchToken };
