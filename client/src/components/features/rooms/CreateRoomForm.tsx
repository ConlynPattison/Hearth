import RealmContext from "@/context/RealmContext";
import { RoomTypeOptions } from "@/util/prisma";
import { RoomScope, RoomType } from "@prisma/client";
import axios from "axios";
import { ChangeEvent, RefObject, useContext, useRef, useState } from "react";
import { mutate } from "swr";

interface CreateRoomFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domainId: number | null;
	roomScope: RoomScope;
}

const CreateDomainForm = ({ dialog, domainId, roomScope }: CreateRoomFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const [isPrivate, setIsPrivate] = useState(false);
	const [roomName, setRoomName] = useState("");
	const [roomType, setRoomType] = useState<RoomType>(RoomType.TEXT);
	const [isAgeRestricted, setIsAgeRestricted] = useState(false);

	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	const changedRoomType = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (RoomTypeOptions.includes(value as RoomType)) {
			setRoomType(value as RoomType);
		}
	}

	const create = async () => {
		if (!activeRealm) {
			alert("Failed to create room, no valid realm");
			return;
		}

		axios.post(`/api/realms/${activeRealm?.realmId}/rooms`, {
			body: {
				domainId,
				isPrivate,
				roomName,
				roomScope,
				roomType,
				roomIconUrl: null,
				roomDescription: (descriptionRef.current && descriptionRef.current.value.length > 0) ?
					descriptionRef.current.value :
					null,
				isAgeRestricted
			},
		}).then(create => {
			if (create.status === 200) {
				alert("Room successfully created!");
				mutate(`/api/realms/${activeRealm?.realmId}/domains`);
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to create room.");
		});
	}

	return (
		<form action={create}>
			<div className="flex flex-col">
				<label>Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="room_name"
						onChange={(e) => setRoomName(e.target.value?.trim())} // TODO: validate this 
						value={roomName}
						required
						minLength={1}
						maxLength={32}
						placeholder="Name your room..." /></label>
				<label>Is this room private?
					<input
						checked={isPrivate}
						onChange={(e) => setIsPrivate(e.target.checked)}
						name="room_is_private"
						type="checkbox" /></label>
				<label>Is this room age restricted?
					<input
						checked={isAgeRestricted}
						onChange={(e) => setIsAgeRestricted(e.target.checked)}
						name="room_is_age_restricted"
						type="checkbox" /></label>
				<label>Select a room type
					<select
						className="dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="room_type"
						onChange={changedRoomType}>
						{RoomTypeOptions.map((optionValue) => {
							return (
								<option
									key={optionValue}
									value={optionValue}
								>
									{optionValue.toLocaleLowerCase()}
								</option>
							);
						})}
					</select>
				</label>
				<label htmlFor="room_description">Enter a description for the room: </label>
				<textarea
					id="room_description"
					ref={descriptionRef}
					className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
					name="room_is_age_restricted"
					placeholder="Type a description..."
				/>
				<button
					className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit"
				>Submit</button>
			</div>
		</form>
	);
};

export default CreateDomainForm;
