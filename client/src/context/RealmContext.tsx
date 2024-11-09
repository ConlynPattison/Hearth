"use client"
import { Realm } from "@prisma/client";
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

// Sends the Id of the active realm if one is chosen otherwise undefined
const RealmContext = createContext<[
	Realm | null,
	Dispatch<SetStateAction<Realm | null>> | undefined]>([null, undefined]);

export const RealmProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [activeRealm, setActiveRealm] = useState<Realm | null>(null);

	return (
		<RealmContext.Provider value={[activeRealm, setActiveRealm]}>
			{children}
		</RealmContext.Provider>
	);
}
export default RealmContext;
