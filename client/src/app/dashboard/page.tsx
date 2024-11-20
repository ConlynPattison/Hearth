"use server"
import Dashboard from "@/components/dashboard/Dashboard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const DashboardPage = async () => {
	return (
		<Dashboard showDirectMessages={true} />
	);
}

export default withPageAuthRequired(
	DashboardPage,
	{
		returnTo: "/dashboard"
	}
);
