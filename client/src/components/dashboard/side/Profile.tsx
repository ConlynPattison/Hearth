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
		<div className="flex flex-col py-3"
			onClick={handleProfileClick}>
			<Image
				className="rounded-full min-w-[70px] self-center shadow-black shadow-md"
				title={username ?? ""}
				alt="Picture"
				src={user?.picture || "/favicon\.ico"}
				width={70}
				height={70} />
			{/* <p
				className="self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap no-underline mt-1"
				title={username ?? ""}>
				{username ?? ""}
			</p> */}
		</div>
	);
}

export default Profile;
