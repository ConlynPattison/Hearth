"use server"
import Dashboard from "@/components/dashboard/Dashboard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const DashboardDirectMessagesPage = async () => {
	console.log("directing ***")

	return (
		<Dashboard showDirectMessages={true} />
	);
}

export default withPageAuthRequired(
	DashboardDirectMessagesPage,
	{
		returnTo: "/dashboard"
	}
);
