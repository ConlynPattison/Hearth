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
						router.push("/dashboard");
					}
				} else {
					setActiveRealm(realms[0] || null);
				}
			} else if (setActiveRealm !== undefined) {
				setActiveRealm(null);
				router.push("/dashboard");
			}
		}
	}, [activeRealm, realms, setActiveRealm, realmId, router]);

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
			<svg width="0" height="0">
				<linearGradient id="icon-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
					<stop stopColor="#7e22ce" offset="20%" />
					<stop stopColor="#ef4444" offset="80%" />
				</linearGradient>
			</svg>
			{!isLoading && realms.map((realm) => (
				<div className={`flex flex-col py-3 hover:cursor-pointer ${activeRealm?.realmId === realm.realmId ? "dark:bg-slate-800 bg-slate-100" : "hover:brightness-90 dark:bg-slate-900 bg-slate-200"}`}
					key={realm.realmId}
					title={realm.realmName}
					onClick={() => { router.replace(`/dashboard/${realm.realmId}`) }}>
					<div className="self-center">
						<FaFireFlameCurved
							className="dark:text-slate-500 text-slate-700"
							size="3em"
							style={{ fill: `${activeRealm?.realmId === realm.realmId && "url(#icon-gradient)"}` }}
						/>
					</div>
					<span className="text-center self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap">
						{realm.realmName}
					</span>
				</div>
			))}
		</>
	);
}

export default Realms;
