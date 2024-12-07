"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { MessageForView } from "@chat-app/types";
import Image from "next/image";
import { Dropdown, DropdownCategoryDivider, DropdownListCategory, DropdownListItem } from "../ui/Dropdown";
import { FaMessage, FaX } from "react-icons/fa6";
import { useContext } from "react";
import RoomContext from "@/context/RoomContext";
import { RoomScope } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { UserDetailedDirectRoom, UserDetailedDirectRoomResponse } from "@/app/api/rooms/route";

const ProfilePicture = ({ avatarUrl, minWidth }: { avatarUrl: string, minWidth?: number }) => {
	const width = minWidth ?? 50;
	const url = avatarUrl || "/favicon\.ico"
	return (
		<div className="flex-none">
			<Image
				className={`rounded-full min-w-[${width}px]`}
				alt="P.P."
				src={url}
				width={width}
				height={width}
			/>
		</div>
	);
}

const Message = ({ message, viewingUserId: loggedInUserId }: { message: MessageForView, viewingUserId: string }) => {
	const sharedClasses = "whitespace-pre w-fit flex-wrap text-wrap rounded-xl px-3 py-2 mb-2 mt-1 break-all"

	const localTime = message.time && new Date(message.time).toLocaleTimeString();

	const [activeRoom] = useContext(RoomContext);

	if (activeRoom === null) return <></>;

	const PrivateChatDropdownContent = () => {
		return (
			<>
			</>
		);
	}

	const RealmDropdownContent = () => {
		const router = useRouter();

		const handleOpenDirectMessage = () => {
			axios.put(`/api/dm/${encodeURIComponent(message.userId)}`)
				.then((res) => {
					const { roomId, detailedRoom } = res.data;
					mutate("/api/rooms",
						((currData: UserDetailedDirectRoomResponse | undefined) => {
							if (!currData?.success || !currData?.rooms) return currData;
							const updatedRooms: UserDetailedDirectRoom[] = [detailedRoom, ...currData.rooms];

							return {
								...currData,
								rooms: updatedRooms
							};
						}), false);
					router.push(`/dashboard/me/${roomId}`);
				})
				.catch((e) => console.error(e));
		}

		return (
			<>
				<DropdownListCategory>
					<DropdownListItem
						icon={<FaMessage />}
						intrinsicProps={{
							title: "Open Direct Message",
							onClick: handleOpenDirectMessage
						}}
					>
						Message <span className="dark:text-slate-400 text-slate-600">{message.displayName}</span>
					</DropdownListItem>
				</DropdownListCategory>
				<DropdownCategoryDivider />
				<DropdownListCategory>
					<DropdownListItem icon={<FaX />}>Remove From Realm</DropdownListItem>
				</DropdownListCategory>
			</>
		);
	}

	return (
		<>
			{
				message.userId === loggedInUserId ?
					<div className="flex flex-row-reverse">
						<div className="flex flex-row-reverse max-w-[85%]">
							<ProfilePicture avatarUrl={message.avatarUrl} minWidth={50} />
							<div>
								<p className={`${sharedClasses} bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200 rounded-tr-none mr-2`}>{message.content}</p>
								<p className={`text-xs text-slate-400 text-right`}>{localTime}</p>
							</div>
						</div>
					</div>
					:
					<div className="flex">
						<div className="flex max-w-[85%]">
							<Dropdown
								openingNode={
									<ProfilePicture avatarUrl={message.avatarUrl} minWidth={50} />
								}
							>
								{activeRoom.roomScope === RoomScope.REALM ?
									<RealmDropdownContent /> :
									<PrivateChatDropdownContent />}
							</Dropdown>
							<div>
								<p className={`${sharedClasses} bg-gradient-to-tl dark:from-red-600 dark:to-yellow-500 from-red-300 to-yellow-200 rounded-tl-none ml-2`}>
									<div className="font-bold text-left text-slate-500 dark:text-slate-50">{message.displayName}</div>{message.content}
								</p>
								<p className={`text-xs text-slate-400 flex ml-2`}>{localTime}</p>
							</div>
						</div>
					</div>
			}
		</>
	);
}

const SentMessages = ({ messages }: { messages: MessageForView[] }) => {
	const { user, isLoading } = useUser();

	if (!user || isLoading) {
		return (
			<>Loading...</>
		);
	}

	return (
		<div className="px-2 mt-auto w-full flex flex-col gap-2">
			{messages.map((message, index) => {
				return (
					<div key={index}
						className="w-[100%]">
						{message.type === "joinLeave"
							? <p>{message.content}</p>
							: <Message message={message} viewingUserId={user.sub ?? ""} />
						}
					</div >
				);
			})}
		</div >
	);
}

export default SentMessages;
