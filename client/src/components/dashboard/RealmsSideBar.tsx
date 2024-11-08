import { FaArrowRightFromBracket, FaComments, FaFireFlameCurved, FaPlus, FaUser } from "react-icons/fa6"
import Modal from "../ui/Modal"
import CreateRealmForm from "./CreateRealmForm"
import { useUser } from "@auth0/nextjs-auth0/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Realm, UsersOnRealms } from "@prisma/client";

const RealmsSideBar = () => {
	const { user } = useUser();
	const username = user?.name;
	const [realms, setRealms] = useState<({
		UsersOnRealms: UsersOnRealms[];
	} & Realm)[]>([]);

	useEffect(() => {
		const fetchRealms = async () => {
			return await axios.get("/api/realms");
		}

		fetchRealms()
			.then(res => {
				const { data } = res;
				if (data.realms) {
					setRealms(data.realms);
				}
			}).catch(e => console.error(e));
	}, []);

	const dialog = useRef<HTMLDialogElement>(null);

	const openModal = (e: FormEvent) => {
		e.stopPropagation();
		if (dialog.current && !dialog.current.open) {
			dialog.current.showModal();
		}
	}
	const closeModal = (e: FormEvent) => {
		e.stopPropagation();
		if (dialog.current) {
			dialog.current.close();
		}
	}

	return (
		<div className="h-[100%] bg-slate-900 w-[100px] pt-3 overflow-y-scroll">
			{/* Profile */}
			<div className="flex flex-col w-[100%]">
				<FaUser size="3em" className="text-slate-500 self-center" />
				<p
					className="self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap no-underline"
					title={username ?? ""}>
					{username ?? ""}
				</p>
			</div>
			<div className="flex flex-col bg-slate-800 py-3">
				<FaComments size="3em" className="self-center text-slate-500" />
			</div>
			<div className="flex flex-col bg-slate-900 py-3">
				<a
					className="hover:cursor-pointer self-center"
					href="/api/auth/logout"
					title="Log out"
				><FaArrowRightFromBracket size="3em"
					className="bg-transparent text-slate-500" />
				</a>
			</div>
			<div>
				{realms.map((realm) => (
					<div className="flex flex-col bg-slate-900 py-3"
						key={realm.realmId}
						title={realm.realmName}>
						<FaFireFlameCurved size="3em" className="self-center text-slate-500" />
						<span className="text-center self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap">
							{realm.realmName}
						</span>
					</div>
				))}
			</div>
			<div className="flex flex-col bg-slate-900 py-3 hover:cursor-pointer"
				onClick={openModal} >
				<FaPlus size="3em" className="self-center text-slate-500" />
			</div>
			<Modal ref={dialog}>
				<CreateRealmForm dialog={dialog} />
				<button type="button" onClick={closeModal}>Close</button>
			</Modal>
		</div>
	)
}

export default RealmsSideBar;
