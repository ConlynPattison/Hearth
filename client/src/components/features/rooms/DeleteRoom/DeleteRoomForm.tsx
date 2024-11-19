import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, forwardRef, useContext } from "react";
import { mutate } from "swr";

interface DeleteRoomFormProps {
	dialog: RefObject<HTMLDialogElement>;
	roomName: string | null;
	roomId: number;
}

const DeleteRoomForm = forwardRef<HTMLFormElement, DeleteRoomFormProps>((
	{ dialog, roomName, roomId }: DeleteRoomFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);

	const deleteRoom = async () => {
		axios.delete(`/api/realms/${activeRealm?.realmId}/rooms/${roomId}`)
			.then(patch => {
				if (patch.status === 200) {
					alert("Realm successfully deleted!");
					mutate(`/api/realms/${activeRealm?.realmId}/domains`);
				}

				dialog.current?.close();
			}).catch(e => {
				console.error(e);
				alert("Failed to delete room");
			});
	}

	return (
		<form action={deleteRoom} ref={ref}>
			<div className="flex flex-col gap-2">
				{roomName &&
					<>
						<p className="font-bold pb-4">
							Room &quot;{roomName}&quot; will be permanently deleted.
						</p>
						<p> Are you sure you want to perform this action?</p>
					</>}
			</div>
		</form>
	);
});

DeleteRoomForm.displayName = "DeleteRoomForm";

export default DeleteRoomForm;
