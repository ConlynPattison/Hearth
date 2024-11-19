import RealmContext from "@/context/RealmContext";
import { Room } from "@prisma/client";
import axios from "axios";
import React, { FormEvent, forwardRef, useEffect } from "react";
import { RefObject, useContext, useState } from "react";
import { mutate } from "swr";
import { DomainsOptions } from "../../domains/PatchDomain/PatchDomainForm";
import { OptionallyParentalDomain } from "../../domains/Domains";

interface PatchRoomFormProps {
	dialog: RefObject<HTMLDialogElement>;
	room: Room;
	domains: OptionallyParentalDomain[];
}

const PatchRoomForm = forwardRef<HTMLFormElement, PatchRoomFormProps>((
	{ dialog, room, domains }: PatchRoomFormProps, ref
) => {
	const [activeRealm] = useContext(RealmContext);

	const [isPrivate, setIsPrivate] = useState(room.isPrivate);
	const [roomName, setRoomName] = useState(room.roomName ?? "");
	const [parentDomainId, setParentDomainId] = useState(room.domainId);
	const [isAgeRestricted, setIsAgeRestricted] = useState(room.isAgeRestricted);
	const [roomDescription, setRoomDescription] = useState(room.roomDescription ?? "");

	useEffect(() => {
		setIsPrivate(room.isPrivate);
		setRoomName(room.roomName ?? "");
		setParentDomainId(room.domainId);
		setIsAgeRestricted(room.isAgeRestricted);
		setRoomDescription(room.roomDescription ?? "");
	}, [room]);

	useEffect(() => {
		if (!dialog.current) return;
		const dialogRef = dialog.current;

		const resetForm = () => {
			setIsPrivate(room.isPrivate);
			setRoomName(room.roomName ?? "");
			setParentDomainId(room.domainId);
			setIsAgeRestricted(room.isAgeRestricted);
			setRoomDescription(room.roomDescription ?? "");
		}
		dialogRef.addEventListener("close", resetForm);

		return () => dialogRef.removeEventListener("close", resetForm);
	}, [dialog, room]);

	const patch = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!activeRealm) {
			alert("Failed to update room, no valid realm");
			return;
		}

		axios.patch(`/api/realms/${activeRealm?.realmId}/rooms`, {
			body: {
				domainId: parentDomainId,
				roomId: room.roomId,
				isPrivate,
				roomName,
				roomScope: room.roomScope,
				roomType: room.roomType,
				roomIconUrl: room.roomIconUrl, // todo:
				roomDescription: (roomDescription.length > 0) ?
					roomDescription :
					null,
				isAgeRestricted
			},
		}).then(create => {
			if (create.status === 200) {
				alert("Room successfully updated!");
				mutate(`/api/realms/${activeRealm?.realmId}/domains`);
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to update room.");
		});
	}

	return (
		<form onSubmit={patch} ref={ref}>
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
				<label className="flex">Parent domain:
					<select
						className="dark:bg-slate-600 bg-slate-200 ml-auto rounded-sm"
						name="room_domain"
						value={parentDomainId ?? undefined}
						onChange={(e) => setParentDomainId(parseInt(e.target.value, 10))}
					>
						<option
							value={undefined}
							className="italic"
						>- Root -</option>
						<DomainsOptions key="root_domain" domains={domains} depth={0} maxDepth={3} />
					</select>
				</label>
				<div className="flex flex-col">
					<label htmlFor="room_description">Enter a description for the room: </label>
					<textarea
						id="room_description"
						value={roomDescription}
						onChange={(e) => setRoomDescription(e.target.value)}
						maxLength={256}
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="room_is_description"
						placeholder="Type a description..."
					/>
				</div>
			</div>
		</form>
	);
});

PatchRoomForm.displayName = "PatchRoomForm";

export default PatchRoomForm;
