"use client"
import { Message } from "@chat-app/types";

const SentMessages = ({ messages, username }: { messages: Message[], username: string }) => {
    const sharedClasses = "whitespace-pre w-fit max-w-[75%] flex-wrap text-wrap rounded-xl px-3 py-2 mb-2"

    return (
        <div>
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
                                                <p className={`${sharedClasses} bg-gradient-to-tl from-purple-700 to-red-500  rounded-tr-none mr-1`}>{message.content}</p>
                                            </div>
                                            :
                                            <div>
                                                <p className={`${sharedClasses} bg-gradient-to-tl from-red-600 to-yellow-500 rounded-tl-none`}>{message.content}</p>
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
