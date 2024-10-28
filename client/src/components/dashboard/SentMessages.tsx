"use client"
import { Message } from "@chat-app/types";
import { useEffect, useRef } from "react";

const SentMessages = ({ messages, username }: { messages: Message[], username: string }) => {
    const scrollBox = useRef<HTMLDivElement>(null)

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
                                                <p className="whitespace-pre bg-zinc-500 w-fit max-w-[75%] flex-wrap text-wrap rounded-md px-1 rounded-tr-none mb-1 mr-1">{message.content}</p>
                                            </div>
                                            :
                                            <div>
                                                <p className="whitespace-pre bg-zinc-500 w-fit max-w-[75%] flex-wrap text-wrap rounded-md px-1 rounded-tl-none mb-1">{message.content}</p>
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
