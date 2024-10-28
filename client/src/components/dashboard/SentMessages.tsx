"use client"
import { Message } from "@chat-app/types";
import { useEffect, useRef } from "react";

const SentMessages = ({ messages, username }: { messages: Message[], username: string }) => {
    const scrollBox = useRef<HTMLDivElement>(null)
    const sharedClasses = "whitespace-pre w-fit max-w-[75%] flex-wrap text-wrap rounded-xl px-3 py-2"

    useEffect(() => {
        if (!scrollBox.current) return;
        scrollBox.current.scrollTop = scrollBox.current.scrollHeight
    }, [messages]);

    return (
        <div className="h-[400px] overflow-y-auto"
            ref={scrollBox}>
            {messages.map((message, index) => {
                return (
                    <div key={index}
                        className="w-[100%] my-2">
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
                                                <p className={`${sharedClasses} bg-gradient-to-tl from-red-600 to-yellow-500 rounded-tl-none mb-1`}>{message.content}</p>
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
