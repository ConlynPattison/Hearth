"use server"
import Dashboard from "@/components/dashboard/Dashboard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const DashboardRealmPage = async ({ params }: { params?: Record<string, string | string[]> }) => {
	const realmId = params?.realmId;

	return (
		<Dashboard realmId={realmId as string} />
	);
}

export default withPageAuthRequired(
	DashboardRealmPage,
	{
		returnTo: "/dashboard"
	}
);
