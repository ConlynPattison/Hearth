import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";

const CollapsableHeading = ({ heading, children }: { heading: string, children?: ReactNode }) => {
	const [showing, setShowing] = useState(true);

	return (
		<>
			<div
				className="hover:cursor-pointer hover:dark:brightness-90 w-full overflow-hidden flex mt-8"
				onClick={() => { setShowing(curr => !curr) }}
			>
				<div className="pr-1">
					{showing ? <FaAngleDown /> : <FaAngleRight />}
				</div>
				<div className="font-bold text-xs dark:text-slate-400 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
					{heading}
				</div>
			</div>
			{showing && children}
		</>
	);
}

const TemplateConversation = ({ selected }: { selected: boolean }) => {
	const messagingUsername = "Username";

	const bg = selected ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-200";

	return (
		<div className={`${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer rounded-md p-1 flex h-[65px] my-1`}
			title={messagingUsername}>
			<Image
				className="rounded-full max-h-[40px] my-auto"
				alt="Picture"
				src={"/favicon\.ico"}
				width={40}
				height={40} />
			<div className="flex flex-col mx-1 overflow-hidden">
				<div className="font-bold overflow-x-hidden whitespace-nowrap text-ellipsis">
					{messagingUsername}
				</div>
				<div className={`text-xs overflow-hidden text-ellipsis line-clamp-2 text-slate-500 ${selected ? "dark:text-slate-300" : "dark:text-slate-400"}`}>
					<span className="font-bold">Me: </span>This is text that will be cut. short when it overflows here is an example ho
				</div>
			</div>
		</div>
	);
}

const TemplateGroupChat = ({ selected }: { selected: boolean }) => {
	const user = useUser();
	const url = user.user?.picture ?? "";
	const chatName = "TheBigCarl, Bad-Dragon Azmoda";

	const bg = selected ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-200";

	return (
		<div className={`${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer  rounded-md p-1 flex h-[65px] my-1`}
			title={chatName}>
			<div className="w-[40px] flex-shrink-0 relative mt-2">
				<Image
					className="rounded-full max-h-[30px] absolute translate-x-[12px] translate-y-[10px] z-10"
					alt="Picture"
					src={"/favicon\.ico"}
					width={30}
					height={30} />
				<Image
					className="rounded-full max-h-[30px] absolute"
					alt="Picture"
					src={url ?? ""}
					width={30}
					height={30} />
			</div>
			<div className="flex flex-col mx-1 overflow-hidden">
				<div className="font-bold overflow-x-hidden whitespace-nowrap text-ellipsis">
					{chatName}
				</div>
				<div className={`text-xs overflow-hidden text-ellipsis line-clamp-2 text-slate-500 ${selected ? "dark:text-slate-300" : "dark:text-slate-400"}`}>
					<span className="font-bold">Me: </span>This is text that will be cut. short when it overflows here is an example ho
				</div>
			</div>
		</div>
	);
}

const PersonalContainer = () => {
	// todo: fetch all of the rooms that are direct messages or group chats for this user using UsersOnRooms
	// 		 where the user's hasLeft === false

	// todo: map the rooms based on the roomType (.DIRECT_MESSAGE | .GROUP_CHAT) and whether the user has
	// 		 favorited the room 
 
	// todo: using the url "domain/dashboard/me/[roomId]" map to the room with the respective room if the chat w/the id exists

	return (
		<div className="flex flex-col h-[100%] sm:w-[240px] px-2 select-none">
			<div className="flex hover:dark:bg-slate-700 hover:bg-slate-300 dark:bg-slate-800 bg-slate-200 py-2 rounded-md mt-3 hover:cursor-pointer"
				title="Open Friends Panel">
				<div className="px-4"><FaUserFriends className="self-center" size="1.5em" /> </div>Friends
			</div>
			<CollapsableHeading heading="Starred Conversations">
				<TemplateGroupChat selected={false} />
				<TemplateConversation selected={false} />
				<TemplateGroupChat selected={true} />
			</CollapsableHeading>
			<CollapsableHeading heading="Direct Messages">
				<TemplateConversation selected={false} />
				<TemplateConversation selected={false} />
				<TemplateConversation selected={false} />
				<TemplateConversation selected={false} />
			</CollapsableHeading>
			<CollapsableHeading heading="Group Chats">
				<TemplateGroupChat selected={false} />
				<TemplateGroupChat selected={false} />
				<TemplateGroupChat selected={false} />
			</CollapsableHeading>
		</div>
	);
}

export default PersonalContainer;
