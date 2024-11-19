"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Profile = () => {
	const { user } = useUser();
	const username = user?.name;

	const router = useRouter();

	const handleProfileClick = () => {
		router.replace("/dashboard");
	}

	return (
		<div className="flex py-3 relative"
			onClick={handleProfileClick}>
			<Image
				className="rounded-full min-w-[70px] mx-auto shadow-black shadow-md"
				title={username ?? ""}
				alt="Picture"
				src={user?.picture || "/favicon\.ico"}
				width={70}
				height={70} />
			<div className="dark:bg-slate-900 bg-opacity-80 bg-slate-200 w-[22px] h-[22px] absolute rounded-full flex translate-x-[60px] translate-y-[50px]">
				<div className="bg-green-700 w-[16px] h-[16px] rounded-full m-auto"></div>
			</div>
		</div>
	);
}

export default Profile;
