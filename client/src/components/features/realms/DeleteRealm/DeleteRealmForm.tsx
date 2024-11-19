import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, forwardRef, useContext, useEffect, useState } from "react";
import { mutate } from "swr";

interface DeleteRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const DeleteRealmForm = forwardRef<HTMLFormElement, DeleteRealmFormProps>((
	{ dialog }: DeleteRealmFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);
	const [realmName, setRealmName] = useState("");

	useEffect(() => {
		if (!dialog.current) return;
		const dialogRef = dialog.current;

		const resetForm = () => {
			setRealmName("");
		}
		dialogRef.addEventListener("close", resetForm);

		return () => dialogRef.removeEventListener("close", resetForm);
	}, [dialog]);

	const deleteRealm = async () => {
		axios.delete(`/api/realms/${activeRealm?.realmId}`)
			.then(patch => {
				if (patch.status === 200) {
					alert("Realm successfully deleted!");
					mutate("/api/realms");
				}

				dialog.current?.close();
			}).catch(e => {
				console.error(e);
				alert("Failed to delete realm");
			});
	}

	return (
		<form action={deleteRealm} ref={ref}>
			<div className="flex flex-col gap-2">
				<div>
					<p><strong>Warning: </strong>Deleting a realm removes it from Hearth entirely.</p>
					<p> To confirm, type the name of your realm below: </p>
				</div>
				<label className="flex flex-col">Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 px-1 rounded-sm hover:brightness-90"
						name="realm_name"
						required
						value={realmName}
						onChange={(e) => setRealmName(e.target.value)}
						maxLength={16}
						minLength={1}
						placeholder="Type realm name..." /></label>
			</div>
		</form>
	);
});

DeleteRealmForm.displayName = "DeleteRealmForm";

export default DeleteRealmForm;
