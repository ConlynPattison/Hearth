"use client"
import { UsersOnRealms, Realm } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaFireFlameCurved } from "react-icons/fa6";
import useSWR from "swr";

interface RealmsProps {
	realmId?: string
}

const Realms = ({ realmId }: RealmsProps) => {
	const router = useRouter();

	const fetcher = (url: string) => axios.get(url).then(res => res.data);
	const { data, error, isLoading } = useSWR('/api/realms', fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	});

	const [currRealmId, setCurrRealmId] = useState("");

	useEffect(() => {
		if (realmId) setCurrRealmId(realmId);
	}, [realmId])

	const defaultRealms = data ? data.realms as ({
		UsersOnRealms: UsersOnRealms[];
	} & Realm)[] : []

	const [realms, setRealms] = useState<({
		UsersOnRealms: UsersOnRealms[];
	} & Realm)[]>(defaultRealms);

	useEffect(() => {
		if (!isLoading && data) {
			setRealms(data.realms);
		}

		if (error) {
			console.error(error);
		}
	}, [data, error, isLoading]);

	if (isLoading) return <>Loading...</>
	if (error) return <>Error: {error.message}</>

	return (
		<>
			{!isLoading && realms.map((realm) => (
				<div className={`flex flex-col py-3 hover:cursor-pointer ${Number(currRealmId) === realm.realmId ? "bg-slate-800" : "bg-slate-900"}`}
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
