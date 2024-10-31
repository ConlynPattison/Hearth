import { fetchToken } from "@/util/auth";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

// Under the context of a user-authentication-required route, fetch a JWT to use when instantiating the socket
export const GET = withApiAuthRequired(async () => {
	const postAuthPayload = await fetchToken();

	if (!postAuthPayload) {
		return NextResponse.json({ error: "Auth token not found" }, { status: 401 })
	}

	return NextResponse.json({ token: postAuthPayload.access_token }, { status: 200 });
});
