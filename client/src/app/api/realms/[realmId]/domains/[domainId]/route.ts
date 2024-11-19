import { ADMIN_LEVELS, checkUserAuthentication, checkUserRealmAuthorization } from "@/util/auth";
import prisma from "@/util/postgres";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const getSchema = z.object({
	realmId: z.string().transform((id) => parseInt(id, 10)),
	domainId: z.string().transform((id) => parseInt(id, 10))
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
			return NextResponse.json({ success: false, message: `Invalid arguments for get realm with error: ${parsedParams.error}` }, { status: 400 });
		}

		const { realmId, domainId } = parsedParams.data;

		const authorizationResult = await checkUserRealmAuthorization(userAuth0Id, realmId, ADMIN_LEVELS);
		if (!authorizationResult.authorized) {
			return NextResponse.json({ success: false, message: authorizationResult.message }, { status: authorizationResult.status });
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