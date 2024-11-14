import prisma from "@/util/postgres";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { UsersOnRealmsLevels } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const getSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10)),
	domainId: z.string().transform((id) => parseInt(id, 10))
});

const deleteSchema = getSchema;

const DELETE = withApiAuthRequired(async (req: NextRequest, { params }) => {
	try {
		// Is the user authenticated?
		const session = await getSession(req, new NextResponse());

		if (!session || !session.user || typeof session.user.sub !== "string") {
			console.error("Failed to get user session data");
			return NextResponse.json({ success: false, message: "Failed to get user session data" }, { status: 401 });
		}
		const userAuth0Id = session.user.sub;

		const parsedParams = deleteSchema.safeParse(params);
		if (!parsedParams.success) {
			return NextResponse.json({ success: false, message: `Invalid arguments for get realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId, domainId } = parsedParams.data;

		// check authorization (must be >= admin)
		const authorization = await prisma.usersOnRealms.findFirst({
			where: {
				auth0Id: userAuth0Id,
				realmId,
				memberLevel: {
					in: [UsersOnRealmsLevels.ADMIN, UsersOnRealmsLevels.OWNER]
				}
			}
		});

		if (authorization === null) {
			return NextResponse.json({ success: false, message: `Realm with realmId ${realmId} not found within admin realms of userId ${userAuth0Id}` }, { status: 404 });
		}

		const parentOfDeleting = await prisma.domain.findFirst({
			where: {
				realmId,
				children: {
					some: {
						domainId
					}
				}
			}
		});

		await prisma.$transaction(async (prisma) => {
			await prisma.domain.updateMany({
				where: {
					parentDomainId: domainId
				},
				data: {
					parentDomainId: parentOfDeleting?.domainId || null
				}
			});

			await prisma.room.updateMany({
				where: {
					domainId
				},
				data: {
					domainId: parentOfDeleting?.domainId || null
				}
			})

			await prisma.domain.delete({
				where: {
					realmId,
					domainId
				}
			});
		});

		return NextResponse.json({ success: true, message: `DomainId: ${domainId} successfully deleted, parentOfDeleting: ${parentOfDeleting?.domainName}` }, { status: 200 });
	}
	catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, message: `Server error: ${err}` }, { status: 500 })
	}
});

export { DELETE };