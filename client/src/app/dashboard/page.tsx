"use client"
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import ChatRoomContainer from "../components/dashboard/MessagesContainer";
import { FaAngleDown, FaComments, FaUser } from "react-icons/fa6";

const Dashboard = () => {
	const {
		user,
	} = useUser();

	const username = user?.name;

	return (
		<div className="flex h-screen">
			{/* Left edge nav bar */}
			<div className="h-[100%] bg-blue-500 w-[100px] p-2">
				<div className="p-1">
					<FaUser size="3em" className="m-auto" />
					<div className="w-[100%] text-center">
						<p className="text-sm h-[1.2em] w-[80%] overflow-hidden text-ellipsis whitespace-nowrap">
							<abbr className="no-underline" title={username ?? ""}>{username ?? ""}</abbr>
						</p>
						<FaAngleDown className="translate-x-16 -translate-y-4" />
					</div>
					{/* <Fa */}
					<FaComments size="3em" className="m-auto" />
				</div>
			</div>

			{/* Outer container */}
			<div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex">

				{/* Left middle inbox & rooms */}
				<div className="bg-blue-700 sm:w-[400px] sm:h-[100%]">
				</div>

				{/* Right middle messages */}
				<div className="bg-slate-400 w-[100%] h-[100%] p-2">
					<ChatRoomContainer room={"room1"} />
				</div>

				{/* Right edge profile info */}
				<div className="bg-violet-400 sm:w-[300px] sm:h-[100%]">
				</div>
			</div>
		</div>
	);
}

export default withPageAuthRequired(
	Dashboard,
	{
		returnTo: "/dashboard"
	}
)
