import ChatRoomContainer from "../components/MessagesContainer";

const Temp = () => {
    return (
        <>
            <div className="flex h-screen">
                {/* Left edge nav bar */}
                <div className="h-[100%] bg-blue-500 w-[80px]">
                </div>

                {/* Outer container */}
                <div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex">

                    {/* Left middle inbox & rooms */}
                    <div className="bg-blue-700 sm:w-[400px] h-[100%]">
                    </div>

                    {/* Right middle messages */}
                    <div className="bg-slate-500 w-[100%] h-[100%] p-2">
                        <ChatRoomContainer room={"room1"} />
                    </div>

                    {/* Right edge profile info */}
                    <div className="bg-violet-400 sm:w-[300px] h-[100%]">
                    </div>
                </div>
            </div>
        </>
    );
}

export default Temp;
