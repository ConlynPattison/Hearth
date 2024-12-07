"use client"
import { FactionsOnUsersOnRealms, Realm, UsersOnRealms } from "@prisma/client";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

type DetailedUsersOnRealms = UsersOnRealms & {
	user: {
		avatarUrl: string,
		displayName: string,
	}
} & FactionsOnUsersOnRealms;

export type RealmWithAuth = {
	UsersOnRealms: DetailedUsersOnRealms[];
} & Realm

const RealmContext = createContext<[
	RealmWithAuth | null,
	Dispatch<SetStateAction<RealmWithAuth | null>> | undefined]>([null, undefined]);

export const RealmProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [activeRealm, setActiveRealm] = useState<RealmWithAuth | null>(null);

	useEffect(() => {
		if (activeRealm !== null) {
			document.title = `Hearth | ${activeRealm?.realmName}`;
		}
	}, [activeRealm])

	return (
		<RealmContext.Provider value={[activeRealm, setActiveRealm]}>
			{children}
		</RealmContext.Provider>
	);
}
export default RealmContext;
