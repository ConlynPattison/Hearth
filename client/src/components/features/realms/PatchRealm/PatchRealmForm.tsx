import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, forwardRef, useContext, useEffect, useState } from "react";
import { mutate } from "swr";

interface PatchRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const PatchRealmForm = forwardRef<HTMLFormElement, PatchRealmFormProps>((
	{ dialog }: PatchRealmFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);

	const [realmName, setRealmName] = useState(activeRealm?.realmName || "");
	const [isPrivate, setIsPrivate] = useState(activeRealm?.isSearchable || false);

	useEffect(() => {
		if (activeRealm !== null) {
			setRealmName(activeRealm.realmName);
			setIsPrivate(!activeRealm.isSearchable);
		}
	}, [activeRealm]);

	const patch = async () => {
		axios.patch("/api/realms", {
			body: {
				isSearchable: !isPrivate,
				realmName,
				realmId: activeRealm?.realmId
			},
		}).then(patch => {
			if (patch.status === 200) {
				alert("Realm successfully updated!");
				mutate("/api/realms");
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to update realm, invalid arguments provided.");
		});
	}

	return (
		<form action={patch} ref={ref}>
			<div className="flex flex-col gap-2">
				<label className="flex flex-col">Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 px-1 rounded-sm hover:brightness-90"
						name="realm_name"
						required
						maxLength={16}
						minLength={1}
						value={realmName}
						onChange={(e) => setRealmName(e.target.value)}
						placeholder="Rename your realm..." /></label>
				<label className="flex">Is this realm private?
					<input
						className="ml-auto"
						name="realm_is_private"
						checked={isPrivate}
						onChange={((e) => setIsPrivate(e.target.checked))}
						type="checkbox" /></label>
			</div>
		</form>
	);
});

PatchRealmForm.displayName = "PatchRealmForm";

export default PatchRealmForm;
