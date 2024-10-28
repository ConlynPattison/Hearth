"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { Message } from "@chat-app/types";
import { FaUser } from "react-icons/fa6";

const ProfilePicture = ({ usernameSentFrom }: { usernameSentFrom: string }) => {
	const { user } = useUser();

	if (!user || user.name !== usernameSentFrom) {
		return (
			<div>
				<FaUser // TODO: change to be the saved user's picture
					size="3em"
					className="text-slate-500 self-center rounded-full max-w-[50px]" />
			</div>
		);
	}

	return (
		<div>
			{user?.picture &&
				<img
					className="rounded-full max-w-[50px]"
					alt="PP"
					src={user.picture}
				/>}
		</div>
	);

}

const SentMessages = ({ messages, username }: { messages: Message[], username: string }) => {
	const sharedClasses = "whitespace-pre w-fit flex-wrap text-wrap rounded-xl px-3 py-2 mb-2 mt-1"

	return (
		<div className="px-2">
			{messages.map((message, index) => {
				return (
					<div key={index}
						className="w-[100%]">
						{
							message.type === "joinLeave"
								? <p>{message.content}</p>
								:
								<>
									<p className={message.user === username ? "text-right" : ""}>{message.user}:</p>
									{
										message.user === username ?
											<div className="flex flex-row-reverse">
												<div className="flex flex-row-reverse max-w-[85%]">
													<ProfilePicture usernameSentFrom={message.user} />
													<p className={`${sharedClasses} bg-gradient-to-tl from-purple-700 to-red-500  rounded-tr-none mr-2`}>{message.content}</p>
												</div>
											</div>
											:
											<div className="flex">
												<div className="flex max-w-[85%]">
													<ProfilePicture usernameSentFrom={message.user} />
													<p className={`${sharedClasses} bg-gradient-to-tl from-red-600 to-yellow-500 rounded-tl-none ml-2`}>{message.content}</p>
												</div>
											</div>
									}
								</>
						}

					</div >
				);
			})}
		</div >
	);
}

export default SentMessages;
