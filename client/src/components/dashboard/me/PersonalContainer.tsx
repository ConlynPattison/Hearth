import { UserDetailedDirectRoom, UserDetailedDirectRoomResponse } from "@/app/api/rooms/route";
import CollapsableHeading from "@/components/ui/CollapsableHeading";
import { Dropdown, DropdownCategoryDivider, DropdownListCategory, DropdownListItem } from "@/components/ui/Dropdown";
import RoomContext from "@/context/RoomContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { RoomScope } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaArrowLeft, FaClipboard, FaRegStar, FaStar } from "react-icons/fa6";
import useSWR, { mutate } from "swr";

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

interface StarProps {
	room: UserDetailedDirectRoom
}

const Star = ({ room }: StarProps) => {
	const handleStarClicked = () => {
		if (!room.requestingUserInRoom) return;

		const nowFavorited = !room.requestingUserInRoom.isFavorited;

		mutate("/api/rooms",
			((currData: UserDetailedDirectRoomResponse | undefined) => {
				if (!currData?.success || !currData?.rooms) return currData;
				const updatedRooms = currData.rooms.map((currRoom) => {
					if (currRoom.roomId !== room.roomId) return currRoom;
					return {
						...currRoom,
						requestingUserInRoom: {
							isFavorited: nowFavorited,
							hasLeft: currRoom.requestingUserInRoom?.hasLeft ?? false
						}
					}
				})
				return {
					...currData,
					rooms: updatedRooms
				};
			}), false);

		// make axios call to update the favorited status
		axios.patch("/api/rooms", {
			body: {
				roomId: room.roomId,
				isFavorited: nowFavorited
			}
		}).then((res) => {
			if (res.status !== 200)
				throw new Error("Failed to update favorited property");
		}).catch(err => {
			mutate("/api/rooms");
			console.error(err);
		});
	}

	return (
		<div className="z-20 absolute translate-y-2 hidden group-hover:inline-block p-1"
			onClick={handleStarClicked}>
			{room.requestingUserInRoom?.isFavorited ?
				<FaStar className="dark:text-amber-400 text-amber-500" title="Unstar" /> :
				<FaRegStar className="dark:text-slate-300 text-slate-800" title="Star" />}
		</div>
	);
}

const ChatMenu = () => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<div className={`${isDropdownOpen ? "inline" : "hidden group-hover:inline"} ml-auto flex-shrink-0`}>
			<Dropdown
				useBars
				onOpen={() => setIsDropdownOpen(true)}
				onClose={() => setIsDropdownOpen(false)}
			>
				<DropdownListCategory>
					<DropdownListItem
						icon={<FaArrowLeft />}
						intrinsicProps={{
							title: "Coming Soon!"
						}}
					>Leave Chat</DropdownListItem>
				</DropdownListCategory>
				<DropdownCategoryDivider />
				<DropdownListCategory>
					<DropdownListItem
						icon={<FaClipboard />}
						intrinsicProps={{
							title: "Coming Soon!"
						}}
					>Copy Chat ID</DropdownListItem>
				</DropdownListCategory>
			</Dropdown>
		</div>
	)
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
		<div className={`group ${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer rounded-md flex`}
			title={messagingUsername}>
			<div className="relative flex-shrink-0">
				<Star room={room} />
			</div>
			<Link className="z-10 p-1 flex h-[65px] my-1 flex-shrink flex-grow min-w-0 w-full"
				href={`/dashboard/me/${room.roomId}`}
			>
				<Image
					className="rounded-full max-h-[40px] min-w-[40px] my-auto"
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
			</Link>
			<ChatMenu />
		</div>
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
		<div className={`group ${bg} hover:dark:bg-slate-700 hover:bg-slate-200 hover:cursor-pointer rounded-md flex`}
			title={chatName}>
			<div className="relative flex-shrink-0">
				<Star room={room} />
			</div>
			<Link className="z-10 p-1 flex h-[65px] my-1 flex-shrink flex-grow min-w-0 w-full"
				href={`/dashboard/me/${room.roomId}`}
			>
				<div className="w-[40px] flex-shrink-0 relative mt-2">
					<GroupChatImage roomIconUrl={room.roomIconUrl} usersInRoom={room.UsersInRooms} />
				</div>
				<div className="flex flex-col mx-1 overflow-hidden w-full">
					<div className="font-bold overflow-x-hidden whitespace-nowrap text-ellipsis">
						{chatName}
					</div>
					<div className={`text-xs overflow-hidden text-ellipsis line-clamp-2 text-slate-500 ${selected ? "dark:text-slate-300" : "dark:text-slate-400"}`}>
						<span className="font-bold">{lastSentMessageUser}</span> {messagePreview}
					</div>
				</div>
			</Link >
			<ChatMenu />
		</div>
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
			<div className="overflow-y-auto">
				<CollapsableHeading heading="Starred Conversations">
					{data?.rooms
						.filter((room) => room.requestingUserInRoom?.isFavorited)
						.map((room) =>
							room.roomScope === RoomScope.DIRECT_MESSAGE ?
								<DirectMessage key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} /> :
								<GroupChat key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
						)}
				</CollapsableHeading>
				<CollapsableHeading heading="Direct Messages">
					{data?.rooms
						.filter((room) => room.requestingUserInRoom?.isFavorited === false && room.roomScope === RoomScope.DIRECT_MESSAGE)
						.map((room) =>
							<DirectMessage key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
						)}
				</CollapsableHeading>
				<CollapsableHeading heading="Group Chats">
					{data?.rooms
						.filter((room) => room.requestingUserInRoom?.isFavorited === false && room.roomScope === RoomScope.GROUP_CHAT)
						.map((room) =>
							<GroupChat key={room.roomId} selected={activeRoom?.roomId === room.roomId} room={room} />
						)}
				</CollapsableHeading>
			</div>
		</div>
	);
}

export default PersonalContainer;
