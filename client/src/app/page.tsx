"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
	const [username, setUsername] = useState("");

	useEffect(() => {
		localStorage.removeItem("username");
	}, []);

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<label htmlFor="username">
					Username: <input
						className="bg-zinc-500 rounded border-2 border-zinc-400"
						type="text"
						name="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					></input>
				</label>
				<Link
					onClick={() => localStorage.setItem("username", username)}
					href={{
						pathname: "/dashboard",
					}}
				>
					Enter Room
				</Link>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
			</footer>
		</div>
	);
}
