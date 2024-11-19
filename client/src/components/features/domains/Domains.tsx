import RealmContext from "@/context/RealmContext";
import { Domain, Permissions, Room, RoomScope } from "@prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import useSWR from "swr";
import CreateDomain from "./CreateDomain/CreateDomain";
import DeleteDomain from "./DeleteDomain/DeleteDomain";
import PatchDomain from "./PatchDomain/PatchDomain";
import CreateRoom from "../rooms/CreateRoom/CreateRoom";
import RoomItem from "../rooms/Room";
import RoomContext from "@/context/RoomContext";

type PermissionedDomain = Domain & {
	DomainPermissions: Permissions[],
	Room: Room[]
}

export type OptionallyParentalDomain = PermissionedDomain & {
	children: OptionallyParentalDomain[]
}

type GetDomainsData = {
	success: boolean,
	domains: OptionallyParentalDomain[],
	rooms: Room[]
}

interface DomainItemProps {
	domain: OptionallyParentalDomain;
	depth: number;
	visibleDomains: { [key: number]: boolean };
	setVisibleDomains: Dispatch<SetStateAction<{
		[key: number]: boolean;
	}>>;
	parentDomainName: string | null;
	domains: OptionallyParentalDomain[];
}

const DomainItem = (({
	domain,
	depth,
	visibleDomains,
	setVisibleDomains,
	parentDomainName,
	domains
}: DomainItemProps) => {
	const [activeRoom] = useContext(RoomContext);

	const showContents = visibleDomains[domain.domainId] ?? true;

	const handleClick = useCallback(() => {
		setVisibleDomains(curr => ({
			...curr,
			[domain.domainId]: !showContents,
		}));
	}, [domain.domainId, showContents, setVisibleDomains]);

	return (
		<div className={`${depth === 0 ? "mt-6" : "ml-8 mt-2"}`}>
			<div className="flex w-full group">
				<div
					className="hover:cursor-pointer hover:dark:brightness-90 w-full overflow-hidden flex"
					onClick={handleClick}
				>
					<div className="pr-1">
						{showContents ? <FaAngleDown /> : <FaAngleRight />}
					</div>
					<span className="font-bold text-xs dark:text-slate-400 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
						{domain.domainName}
					</span>
				</div>
				<div className="hidden group-hover:flex ml-auto">
					{depth < 2 &&
						<CreateDomain parentDomainName={domain.domainName} parentDomainId={domain.domainId} />}
					<PatchDomain parentDomainName={parentDomainName} domain={domain} domains={domains} />
					<DeleteDomain domainId={domain.domainId} domainName={domain.domainName} />
					<CreateRoom domainId={domain.domainId} domainName={domain.domainName} roomScope={RoomScope.REALM} />
				</div>

			</div>
			{
				showContents &&
				<>
					{domain.Room.map((room) => (
						<RoomItem key={room.roomId} room={room} selected={room.roomId === activeRoom?.roomId} domains={domains} />
					))}
					{domain.children.map((childDomain) =>
						<DomainItem
							visibleDomains={visibleDomains}
							setVisibleDomains={setVisibleDomains}
							key={childDomain.domainId}
							domain={childDomain}
							parentDomainName={domain.domainName}
							depth={depth + 1}
							domains={domains} />)}
				</>
			}
		</div >
	);
});

const Domains = () => {
	const [activeRealm] = useContext(RealmContext);
	const [activeRoom, setActiveRoom] = useContext(RoomContext);

	const [visibleDomains, setVisibleDomains] = useState<{ [key: number]: boolean }>({})

	const url = activeRealm ? `/api/realms/${activeRealm.realmId.toString()}/domains` : null
	const fetcher = (url: string) => axios.get(url).then(res => res.data);
	const { data, error, isLoading } = useSWR<GetDomainsData>(url, fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	});

	// todo: replace with a parsing function that will grab the first found child OR grabs a
	// last-opened realm that's relative to the user's OnRealm entry (add prop)
	useEffect(() => {
		if (activeRoom !== null || data === undefined) return;
		if (setActiveRoom !== undefined && data.rooms.length > 0) setActiveRoom(data.rooms[0]);
	}, [activeRoom, data, setActiveRoom]);

	if (error) return (<>Error: {error}</>);
	if (isLoading) return (<>Loading domains..</>) // TODO: change to skeleton state

	return (
		<div className="select-none overflow-y-scroll sm:h-[100%] h-[300px] ml-2">
			{activeRealm &&
				<div className="pb-2">
					<CreateDomain parentDomainName={null} parentDomainId={null}>
						<span className="font-bold text-xs dark:text-slate-400 text-slate-500"
						>Create new domain</span>
					</CreateDomain>
					<CreateRoom domainId={null} domainName={null} roomScope={RoomScope.REALM}>
						<span className="font-bold text-xs dark:text-slate-400 text-slate-500"
						>Create new room</span>
					</CreateRoom>
				</div>
			}
			{data?.rooms.map((room) => (
				<RoomItem key={room.roomId} room={room} selected={room.roomId === activeRoom?.roomId} domains={data.domains} />
			))}
			{data?.domains.map((domain) => {
				return (
					<DomainItem
						key={domain.domainId}
						domain={domain}
						visibleDomains={visibleDomains}
						setVisibleDomains={setVisibleDomains}
						domains={data?.domains}
						depth={0}
						parentDomainName={null} />
				);
			})}
		</div>
	);
}

export default Domains;
