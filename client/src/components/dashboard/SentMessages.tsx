"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { MessageForView } from "@chat-app/types";
import Image from "next/image";

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

	const localTime = message.time && new Date(message.time).toLocaleTimeString()

	return (
		<>
			<p className={message.userId === loggedInUserId ? "text-right" : ""}>{message.displayName}:</p>
			{
				message.userId === loggedInUserId ?
					<div className="flex flex-row-reverse">
						<div className="flex flex-row-reverse max-w-[85%]">
							<ProfilePicture avatarUrl={message.avatarUrl} minWidth={50} />
							<div>
								<p className={`${sharedClasses} bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200 rounded-tr-none mr-2`}>{message.content}</p>
								<p className={`text-xs text-slate-400`}>{localTime}</p>
							</div>
						</div>
					</div>
					:
					<div className="flex">
						<div className="flex max-w-[85%]">
							<ProfilePicture avatarUrl={message.avatarUrl} minWidth={50} />
							<div>
								<p className={`${sharedClasses} bg-gradient-to-tl dark:from-red-600 dark:to-yellow-500 from-red-300 to-yellow-200 rounded-tl-none ml-2`}>{message.content}</p>
								<p className={`text-xs text-slate-400 flex flex-row-reverse`}>{localTime}</p>
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
		<div className="px-2">
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
