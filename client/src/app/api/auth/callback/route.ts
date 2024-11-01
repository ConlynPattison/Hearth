import prisma from "@/util/postgres";
import { AppRouteHandlerFnContext, handleCallback, getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
	try {
		const response = await handleCallback(req, ctx);

		if (response instanceof NextResponse && response.status !== 200 && response.status !== 302) {
			console.error(`Status found of: ${response.status}; StatusText: ${response.statusText}`)
			return response;
		}

		const session = response instanceof NextResponse
			? await getSession(req, response as NextResponse)
			: null;

		if (!session || !session.user) {
			console.error("Failed to get user session data for upsert");
			return response;
		}

		const { user } = session;

		await prisma.$connect();
		const userUpserted = await prisma.user.upsert({
			update: {
				avatarUrl: user.picture,
			},
			where: {
				auth0Id: user.sub
			},
			create: {
				auth0Id: user.sub,
				username: user.nickname,
				displayName: user.name,
				avatarUrl: user.picture,
				createdAt: new Date(),
				isDeleted: false,
			}
		});
		await prisma.$disconnect();

		console.log(`UserId ${userUpserted.auth0Id} upserted`);

		return response;
	} catch (error) {
		console.error(error);
	}
}
