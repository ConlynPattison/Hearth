"use client"
import { createContext, Dispatch, SetStateAction } from "react";

// Sends the Id of the active realm if one is chosen otherwise undefined
const RealmContext = createContext<[number | null, Dispatch<SetStateAction<number | null>> | undefined]>([null, undefined]);
export default RealmContext;
