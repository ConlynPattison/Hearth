"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa6";

const Profile = () => {
	const { user } = useUser();
	const username = user?.name;

	const router = useRouter();

	const handleProfileClick = () => {
		router.replace("/dashboard");
	}

	return (
		<div className="flex flex-col w-[100%] hover:cursor-pointer"
			onClick={handleProfileClick}>
			<FaUser size="3em" className="dark:text-slate-500 text-slate-700 self-center" />
			<p
				className="self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap no-underline"
				title={username ?? ""}>
				{username ?? ""}
			</p>
		</div>
	);
}

export default Profile;
