"use server"
import { redirect } from "next/navigation";

export default async function HomePage() {
	// Temporarily redirects user to login path or dashboard if authenticated
	redirect("/dashboard/me");
}
