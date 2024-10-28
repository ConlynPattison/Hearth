import { Room } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

const rooms: Room[] = [
    {
        id: 829427992384792,
        name: "room1",
        isPrivate: false
    },
    {
        id: 239873249328,
        name: "Side Populus",
        isPrivate: false
    },
    {
        id: 432984973215,
        name: "Bwazil Room",
        isPrivate: false
    },
    {
        id: 1923048329874982,
        name: "Relish Tides",
        isPrivate: false
    },
    {
        id: 239487312984732,
        name: "Tandom Room Extra",
        isPrivate: false
    }
]

interface InboxProps {
    room: Room,
    setRoom: Dispatch<SetStateAction<Room>>,
    isSelectedRoom: boolean
}

const Inbox = ({ room, setRoom, isSelectedRoom }: InboxProps) => {

    const bg = isSelectedRoom ? "bg-blue-500" : "bg-red-500";
    return (
        <button className={`${bg} p-1 text-center rounded-md w-[100%]`}
            onClick={() => setRoom(room)}
            type="button"
        >
            {room.name}
        </button>
    )
}

interface InboxesContainerProps {
    setRoom: Dispatch<SetStateAction<Room>>,
    selectedRoom: Room
}

const InboxesContainer = ({
    setRoom,
    selectedRoom
}: InboxesContainerProps) => {

    return (
        <div className="flex flex-col">
            {rooms.map((room) =>
                <Inbox
                    key={room.id}
                    room={room}
                    setRoom={setRoom}
                    isSelectedRoom={room.id === selectedRoom.id}
                />
            )}
        </div>
    );
}

export default InboxesContainer;
