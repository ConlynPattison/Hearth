import { UserDetailedDirectRoom, UserDetailedDirectRoomResponse } from "@/app/api/rooms/route";
import RoomContext from "@/context/RoomContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { RoomScope, RoomType } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import useSWR from "swr";

const defaultRoom: UserDetailedDirectRoom = {
	roomDescription: "",
	roomId: 90,
	roomScope: RoomScope.DIRECT_MESSAGE,
	roomName: null,
	roomIconUrl: null,
	roomType: RoomType.TEXT,
	realmId: null,
	domainId: null,
	isAgeRestricted: false,
	isPrivate: false,
	requestingUserInRoom: {
		isFavorited: false,
		hasLeft: false
	},
	UsersInRooms: [{
		userInRoomId: 11,
		user: {
			avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIpicKG-k7jqA9YpyX-k00vlQPjxs78zo-5_bLwZXlIKfwQi8M=s96-c",
			displayName: "Gabi",
		},
		hasLeft: false,
		isFavorited: false,
		auth0Id: "testId"
	},
	{
		userInRoomId: 10,
		user: {
			avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocLjApw0lcnvv6pWMTOtt8sHi0j8GYeKXQcYeLXO8gxkV9z7eSl9=s96-c",
			displayName: "Conlyn",
		},
		hasLeft: false,
		isFavorited: false,
		auth0Id: "google-oauth2|106606994258667919669"
	},
	{
		userInRoomId: 9,
		user: {
			avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocK77Mli5Ay_LuFle__bK4LQ4jWohw5NcZ0RBDxAn9WxFUGS3g=s96-c",
			displayName: "Conner",
		},
		hasLeft: false,
		isFavorited: false,
		auth0Id: "google-oauth2|105827500117644136266"
	},],
}

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

interface GroupChatImageProps {
	roomIconUrl: string | null;
	usersInRoom: ({
		auth0Id: string;
		hasLeft: boolean;
		userInRoomId: number;
		isFavorited: boolean;
	} & {
		user: {
			avatarUrl: string;
			displayName: string;
		};
	})[];
};

const GroupChatImage = ({ roomIconUrl, usersInRoom }: GroupChatImageProps) => {
	const { user } = useUser();

	const useRoomIconUrl = roomIconUrl !== null && roomIconUrl.length > 0;
	const hasEnoughUsers = usersInRoom.length > 2;

	if (useRoomIconUrl || !hasEnoughUsers)
		return (
			<Image
				className="rounded-full max-h-[40px] my-auto"
				alt="Picture"
				src={roomIconUrl || "/favicon\.ico"}
				width={40}
				height={40} />
		);

	const exclusiveUsers = usersInRoom.filter((userInRoom) => userInRoom.auth0Id !== user?.sub);

	return (
		<>
			<Image
				className="rounded-full max-h-[30px] absolute translate-x-[12px] translate-y-[10px] z-10"
				alt="Picture"
				src={exclusiveUsers[0].user.avatarUrl}
				width={30}
				height={30} />
			<Image
				className="rounded-full max-h-[30px] absolute"
				alt="Picture"
				src={exclusiveUsers[1].user.avatarUrl}
				width={30}
				height={30} />
		</>
	);
}

const DirectMessage = ({ room, selected }: { room: UserDetailedDirectRoom, selected: boolean }) => {
	const { user } = useUser();

	const userBeingMessaged = room.UsersInRooms.find((userInRoom) => userInRoom.auth0Id !== user?.sub)
	const messagingUsername = userBeingMessaged?.user.displayName ?? "Unknown User";

	const lastSentMessageUser = room.lastSentMessage ? room.lastSentMessage.displayName + ": " : "";
	const messagePreview = room.lastSentMessage ? room.lastSentMessage.content : "Nothing to show yet. Start the conversation!";

	const bg = selected ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-200";

	return (
		<Link href={`/dashboard/me/${room.roomId}`}>
			<div className={`${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer rounded-md p-1 flex h-[65px] my-1`}
				title={messagingUsername}>
				<Image
					className="rounded-full max-h-[40px] my-auto"
					alt="Picture"
					src={userBeingMessaged?.user.avatarUrl || "/favicon\.ico"}
					width={40}
					height={40} />
				<div className="flex flex-col mx-1 overflow-hidden">
					<div className="font-bold overflow-x-hidden whitespace-nowrap text-ellipsis">
						{messagingUsername}
					</div>
					<div className={`text-xs overflow-hidden text-ellipsis line-clamp-2 text-slate-500 ${selected ? "dark:text-slate-300" : "dark:text-slate-400"}`}>
						<span className="font-bold">{lastSentMessageUser}</span> {messagePreview}
					</div>
				</div>
			</div>
		</Link>
	);
}

const GroupChat = ({ room, selected }: { room: UserDetailedDirectRoom, selected: boolean }) => {
	const { user } = useUser();

	const chatName = room.roomName ? room.roomName :
		room.UsersInRooms
			.filter((userInRoom) => userInRoom.auth0Id !== user?.sub)
			.map((userInRoom) => userInRoom.user.displayName)
			.join(", ");

	const lastSentMessageUser = room.lastSentMessage ? room.lastSentMessage.displayName + ": " : "";
	const messagePreview = room.lastSentMessage ? room.lastSentMessage.content : "Nothing to show yet. Start the conversation!";

	const bg = selected ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-200";

	return (
		<Link href={`/dashboard/me/${room.roomId}`}>
			<div className={`${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer  rounded-md p-1 flex h-[65px] my-1`}
				title={chatName}>
				<div className="w-[40px] flex-shrink-0 relative mt-2">
					<GroupChatImage roomIconUrl={room.roomIconUrl} usersInRoom={room.UsersInRooms} />
				</div>
				<div className="flex flex-col mx-1 overflow-hidden">
					<div className="font-bold overflow-x-hidden whitespace-nowrap text-ellipsis">
						{chatName}
					</div>
					<div className={`text-xs overflow-hidden text-ellipsis line-clamp-2 text-slate-500 ${selected ? "dark:text-slate-300" : "dark:text-slate-400"}`}>
						<span className="font-bold">{lastSentMessageUser}</span> {messagePreview}
					</div>
				</div>
			</div>
		</Link>
	);
}

const PersonalContainer = () => {
	const [activeRoom, setActiveRoom] = useContext(RoomContext);
	const { roomId } = useParams();
	const router = useRouter();

	const parsedRoomId = (typeof roomId === "string") ? parseInt(roomId as string, 10) : null;

	const url = `/api/rooms`;
	const fetcher = (url: string) => axios.get(url).then(res => res.data);
	const { data, error, isLoading } = useSWR<UserDetailedDirectRoomResponse | undefined>(url, fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	});

	useEffect(() => {
		if (data === undefined || isLoading || !data.success) return;
		if (parsedRoomId === null || activeRoom !== null || setActiveRoom === undefined) return;

		const requestedRoom = data.rooms.find((room) => room.roomId === parsedRoomId);
		if (requestedRoom === undefined) {
			router.push("/dashboard/me");
		}
		else {
			setActiveRoom(requestedRoom);
		}

	}, [activeRoom, data, isLoading, setActiveRoom, parsedRoomId, router]);

	if (error) return (<>Error: {error}</>);
	if (isLoading || !data) return (<>Loading directMessages..</>); // TODO: change to skeleton state

	if (data?.success === false) return (<>{data.message}</>);

	return (
		<div className="flex flex-col h-[100%] sm:w-[240px] px-2 select-none pb-4">
			<div className="flex hover:dark:bg-slate-700 hover:bg-slate-300 dark:bg-slate-800 bg-slate-200 py-2 rounded-md mt-3 hover:cursor-pointer"
				title="Open Friends Panel">
				<div className="px-4"><FaUserFriends className="self-center" size="1.5em" /> </div>Friends
			</div>
			<CollapsableHeading heading="Starred Conversations">
				{data?.rooms
					.filter((room) => room.requestingUserInRoom?.isFavorited)
					.map((room) =>
						room.roomScope === RoomScope.DIRECT_MESSAGE ?
							<DirectMessage key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} /> :
							<GroupChat key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
					)}
				<GroupChat selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} />
				{/* <DirectMessage selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
				{/* <GroupChat selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
			</CollapsableHeading>
			<CollapsableHeading heading="Direct Messages">
				{data?.rooms
					.filter((room) => room.requestingUserInRoom?.isFavorited === false && room.roomScope === RoomScope.DIRECT_MESSAGE)
					.map((room) =>
						<DirectMessage key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
					)}
				{/* <DirectMessage selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
				<DirectMessage selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} />
				{/* <DirectMessage selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
				{/* <DirectMessage selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
			</CollapsableHeading>
			<CollapsableHeading heading="Group Chats">
				{data?.rooms
					.filter((room) => room.requestingUserInRoom?.isFavorited === false && room.roomScope === RoomScope.GROUP_CHAT)
					.map((room) =>
						<GroupChat key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
					)}
				{/* <GroupChat selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
				<GroupChat selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} />
				{/* <GroupChat selected={activeRoom?.roomId === defaultRoom.roomId} room={defaultRoom} /> */}
			</CollapsableHeading>
		</div>
	);
}

export default PersonalContainer;
