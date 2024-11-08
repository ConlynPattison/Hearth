"use server"
import { redirect } from "next/navigation";

export default async function Home() {
	// Temporarily redirects user to login path or dashboard if authenticated
	redirect("/dashboard");
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<a
					className="bg-slate-400 rounded px-1"
					type="button"
					href="/dashboard">
					Login
				</a>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
			</footer>
		</div>
	);
}
