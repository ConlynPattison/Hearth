import { checkUserAuthentication, checkUserRealmAuthorization, OWNER_LEVELS } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const getSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10))
});

const GET = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);

		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedParams = getSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for get realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		// Fetch and send the realm data
		const realm = await prisma.realm.findFirst({
			where: {
				UsersOnRealms: {
					some: {
						auth0Id: userAuth0Id,
						realmId: realmId
					}
				}
			},
			include: {
				UsersOnRealms: {
					where: {
						auth0Id: userAuth0Id
					}
				}
			}
		});

		if (realm === null) {
			return NextResponse.json({ success: false, message: `Realm with realmId ${realmId} not found within realms of userId ${userAuth0Id}` }, { status: 404 });
		}

		return NextResponse.json({ success: true, realm }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

const deleteSchema = getSchema;

const DELETE = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		const authResult = await checkUserAuthentication(req);

		if (!authResult.authenticated) {
			return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status });
		}
		const userAuth0Id = authResult.userAuth0Id;

		const parsedParams = deleteSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for delete realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId } = parsedParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, OWNER_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
		}

		const deletedRealm = await prisma.realm.delete({
			where: {
				realmId
			}
		});

		return NextResponse.json({ success: true, message: `Realm with realmId ${deletedRealm.realmId} successfully deleted` });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { GET, DELETE };