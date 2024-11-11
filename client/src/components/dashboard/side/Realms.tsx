"use client"
import RealmContext from "@/context/RealmContext";
import { UsersOnRealms, Realm } from "@prisma/client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { FaFireFlameCurved } from "react-icons/fa6";
import useSWR from "swr";

const Realms = () => {
	const router = useRouter();
	const { realmId } = useParams();

	const fetcher = (url: string) => axios.get(url).then(res => res.data);
	const { data, error, isLoading } = useSWR('/api/realms', fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	});

	const defaultRealms = data ? data.realms as ({
		UsersOnRealms: UsersOnRealms[];
	} & Realm)[] : []

	const [realms, setRealms] = useState<({
		UsersOnRealms: UsersOnRealms[];
	} & Realm)[]>(defaultRealms);

	const [activeRealm, setActiveRealm] = useContext(RealmContext);

	useEffect(() => {
		// If realm has not been initialized yet
		if (activeRealm === null || !realms.some((realm) => realm.realmId === activeRealm.realmId)) {
			// If there are realms to set to
			if (setActiveRealm !== undefined && realms.length > 0) {
				// If there is a param for the intended open realm
				if (realmId && !Array.isArray(realmId) && realmId.length > 0) {
					const realmWithUserData = realms.find((realm) => realm.realmId === parseInt(realmId, 10));
					// if the intended realm DOES exist:
					if (realmWithUserData !== undefined) setActiveRealm(realmWithUserData);
					else {
						router.replace("/dashboard");
					}
				} else {
					setActiveRealm(realms[0] || null);
				}
			} else if (setActiveRealm !== undefined) {
				setActiveRealm(null);
				router.replace("/dashboard");
			}
		}
	}, [activeRealm, realms, setActiveRealm, realmId]);

	useEffect(() => {
		if (!isLoading && data) {
			setRealms(data.realms);
		}

		if (error) {
			console.error(error);
		}
	}, [data, error, isLoading, activeRealm]);

	if (isLoading) return <>Loading...</>
	if (error) return <>Error: {error.message}</>

	return (
		<>
			{!isLoading && realms.map((realm) => (
				<div className={`flex flex-col py-3 hover:cursor-pointer ${activeRealm?.realmId === realm.realmId ? "bg-slate-800" : "bg-slate-900"}`}
					key={realm.realmId}
					title={realm.realmName}
					onClick={() => { router.replace(`/dashboard/${realm.realmId}`) }}>
					<FaFireFlameCurved size="3em" className="self-center text-slate-500" />
					<span className="text-center self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap">
						{realm.realmName}
					</span>
				</div>
			))}
		</>
	);
}

export default Realms;
