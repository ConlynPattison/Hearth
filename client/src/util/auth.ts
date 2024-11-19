import { getSession } from "@auth0/nextjs-auth0";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./postgres";
import { UsersOnRealms, UsersOnRealmsLevels } from "@prisma/client";

type PostAuthPayload = {
	access_token: string,
	token_type: string,
	expires_in: number
}

export const fetchToken = async () => {
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

interface AuthenticationError {
	authenticated: false;
	message: string;
	status: number;
}

interface AuthenticationSuccess {
	authenticated: true;
	userAuth0Id: string;
}

type AuthenticationResponse = AuthenticationError | AuthenticationSuccess;

export const checkUserAuthentication = async (req: NextRequest): Promise<AuthenticationResponse> => {
	const session = await getSession(req, new NextResponse());

	if (!session || !session.user || typeof session.user.sub !== "string") {
		console.error("Failed to get user session data");
		return { authenticated: false, message: "Failed to get user session data", status: 401 };
	}
	const userAuth0Id = session.user.sub;

	return { authenticated: true, userAuth0Id: userAuth0Id }
}

export const OWNER_LEVELS = [UsersOnRealmsLevels.OWNER];
export const ADMIN_LEVELS = [...OWNER_LEVELS, UsersOnRealmsLevels.ADMIN];
export const MEMBER_LEVELS = [...ADMIN_LEVELS, UsersOnRealmsLevels.MEMBER];

interface RealmAuthorizationError {
	authorized: false;
	message: string;
	status: number;
}

interface RealmAuthorizationSuccess {
	authorized: true;
	userOnRealm: UsersOnRealms;
}

type RealmAuthorizationResponse = RealmAuthorizationError | RealmAuthorizationSuccess;

export const checkUserRealmAuthorization = async (userAuth0Id: string, realmId: number, levels: UsersOnRealmsLevels[]): Promise<RealmAuthorizationResponse> => {
	const userOnRealm = await prisma.usersOnRealms.findFirst({
		where: {
			auth0Id: userAuth0Id,
			realmId,
			memberLevel: {
				in: levels
			}
		}
	});

	if (userOnRealm === null) {
		return { authorized: false, message: `UserId ${userAuth0Id} not authorized for request on realmId ${realmId}`, status: 401 };
	}

	return { authorized: true, userOnRealm }
}
