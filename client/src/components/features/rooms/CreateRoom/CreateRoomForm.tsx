import RealmContext from "@/context/RealmContext";
import { RoomTypeOptions } from "@/util/prisma";
import { RoomScope, RoomType } from "@prisma/client";
import axios from "axios";
import React, { FormEvent, forwardRef, useEffect } from "react";
import { ChangeEvent, RefObject, useContext, useRef, useState } from "react";
import { mutate } from "swr";

interface CreateRoomFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domainId: number | null;
	roomScope: RoomScope;
}

const CreateRoomForm = forwardRef<HTMLFormElement, CreateRoomFormProps>((
	{ dialog, domainId, roomScope }: CreateRoomFormProps, ref
) => {
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

	useEffect(() => {
		if (!dialog.current) return;
		const dialogRef = dialog.current;

		const resetForm = () => {
			setIsPrivate(false);
			setRoomName("");
			setRoomType(RoomType.TEXT);
			setIsAgeRestricted(false);
			if (descriptionRef.current) {
				descriptionRef.current.value = "";
			}
		}
		dialogRef.addEventListener("close", resetForm);

		return () => dialogRef.removeEventListener("close", resetForm);
	}, [dialog, descriptionRef]);

	const create = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
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
		<form onSubmit={create} ref={ref}>
			<div className="flex flex-col gap-2">
				<label className="flex flex-col">Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="room_name"
						onChange={(e) => setRoomName(e.target.value?.trim())} // TODO: validate this 
						value={roomName}
						required
						minLength={1}
						maxLength={32}
						placeholder="Name your room..." /></label>
				<label className="flex">Is this room private?
					<input
						className="ml-auto"
						checked={isPrivate}
						onChange={(e) => setIsPrivate(e.target.checked)}
						name="room_is_private"
						type="checkbox" /></label>
				<label className="flex">Is this room age restricted?
					<input
						className="ml-auto"
						checked={isAgeRestricted}
						onChange={(e) => setIsAgeRestricted(e.target.checked)}
						name="room_is_age_restricted"
						type="checkbox" /></label>
				<label className="flex">Select a room type:
					<select
						className="dark:bg-slate-600 bg-slate-200 ml-auto text-center rounded-sm"
						name="room_type"
						value={roomType}
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
				<div className="flex flex-col">
					<label htmlFor="room_description">Enter a description for the room: </label>
					<textarea
						id="room_description"
						ref={descriptionRef}
						maxLength={256}
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="room_is_age_restricted"
						placeholder="Type a description..."
					/>
				</div>
			</div>
		</form>
	);
});

CreateRoomForm.displayName = "CreateRoomForm";

export default CreateRoomForm;
