import { ADMIN_LEVELS, checkUserAuthentication, checkUserRealmAuthorization } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { RoomScope, RoomType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
	domainId: z.number().finite().positive().nullable(), // optionally null for root-level creates
	isPrivate: z.boolean(),
	roomName: z.string().min(1).max(32),
	roomScope: z.nativeEnum(RoomScope),
	roomType: z.nativeEnum(RoomType),
	roomIconUrl: z.string().nullable(),
	roomDescription: z.string().min(1).max(256).nullable(),
	isAgeRestricted: z.boolean()
});

const postQuerySchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

/**
 * Create a room within a realm (with or without a parent domain) 
*/
const POST = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedQueryParams = postQuerySchema.safeParse(params);
		if (!parsedQueryParams.success) {
			return NextResponse.json({ success: false, message: `Invalid query arguments for create room with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedQueryParams.data;

		const { body } = await req.json();

		const parsedBody = postBodySchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json({ success: false, message: `Invalid body arguments for create room with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const {
			domainId,
			isPrivate,
			roomName,
			roomScope,
			roomType,
			roomIconUrl,
			roomDescription,
			isAgeRestricted,
		} = parsedBody.data;

		if (roomScope !== RoomScope.REALM) {
			return NextResponse.json({ success: false, message: `Room creation within realm requires RoomType value of "REALM", received ${roomType}` }, { status: 400 })
		}

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		// is the domainId present? if so, is it on this realm?
		if (domainId !== null) {
			const domain = await prisma.domain.findFirst({
				where: {
					domainId,
					realmId
				}
			});

			if (domain === null) {
				return NextResponse.json({ success: false, message: `DomainId ${domainId} does not exist on realmId ${realmId} for room creation` }, { status: 404 })
			}
		}

		const room = await prisma.room.create({
			data: {
				realmId,
				domainId,
				isPrivate,
				roomName,
				roomScope,
				roomType,
				roomIconUrl,
				roomDescription,
				isAgeRestricted,
			}
		})

		return NextResponse.json({ success: true, message: `Successfully created room of roomId ${room.roomId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const patchBodySchema = z.object({
	domainId: z.number().finite().positive().nullable(),
	roomId: z.number().finite().positive(),
	isPrivate: z.boolean(),
	roomName: z.string(),
	roomScope: z.nativeEnum(RoomScope),
	roomType: z.nativeEnum(RoomType),
	roomIconUrl: z.string().nullable(),
	roomDescription: z.string(),
	isAgeRestricted: z.boolean()
});

const patchQuerySchema = z.object({
	realmId: z.string().transform((value) => parseInt(value, 10))
})

const PATCH = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);
		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedQueryParams = patchQuerySchema.safeParse(params);
		if (!parsedQueryParams.success) {
			return NextResponse.json({ success: false, message: `Invalid path argument for update room in realm with error: ${parsedQueryParams.error}` }, { status: 400 });
		}

		const { body } = await req.json();
		const parsedBodyParams = patchBodySchema.safeParse(body);
		if (!parsedBodyParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for update room in realm with error: ${parsedBodyParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedQueryParams.data;

		const {
			domainId,
			roomId,
			isPrivate,
			roomName,
			roomScope,
			roomType,
			roomIconUrl,
			roomDescription,
			isAgeRestricted
		} = parsedBodyParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		// perform the update TODO: consider the addition of a "updatedAt"
		const patchedRoom = await prisma.room.update({
			where: {
				roomId
			},
			data: {
				domainId,
				isPrivate,
				roomName,
				roomScope,
				roomType,
				roomIconUrl,
				roomDescription,
				isAgeRestricted
			}
		});

		return NextResponse.json({ success: true, message: `Successfully updated room with roomId: ${patchedRoom.roomId}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { POST, PATCH };
