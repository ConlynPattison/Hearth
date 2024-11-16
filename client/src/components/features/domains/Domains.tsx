import RealmContext from "@/context/RealmContext";
import { Domain, Permissions, Room, RoomScope } from "@prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import useSWR from "swr";
import CreateDomain from "./CreateDomain";
import DeleteDomain from "./DeleteDomain";
import PatchDomain from "./PatchDomain";
import CreateRoom from "../rooms/CreateRoom";
import Test from "@/components/ui/Modal.test";

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

const DomainItem = ({
	domain,
	depth,
	visibleDomains,
	setVisibleDomains,
	parentDomainName,
	domains
}: DomainItemProps) => {
	const showContents = visibleDomains[domain.domainId] ?? true;

	return (
		<div className={`${depth === 0 ? "mt-6" : "ml-8 mt-2"}`}>
			<div className="flex w-[100%] group">
				<div
					className="hover:cursor-pointer hover:dark:brightness-90 flex max-w-[95%] overflow-hidden"
					onClick={() => setVisibleDomains(curr => {
						return {
							...curr,
							[domain.domainId]: !showContents
						}
					})}
				>
					<div className="pr-1">
						{showContents ? <FaAngleDown /> : <FaAngleRight />}
					</div>
					<span className="font-bold text-xs dark:text-slate-400 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
						{domain.domainName}
					</span>
				</div>
				<div className="hidden group-hover:flex">
					{depth < 2 &&
						<CreateDomain parentDomainName={domain.domainName} parentDomainId={domain.domainId} />}
					<DeleteDomain domainId={domain.domainId} domainName={domain.domainName} />
					<PatchDomain parentDomainName={parentDomainName} domain={domain} domains={domains} />
					<CreateRoom domainId={domain.domainId} domainName={domain.domainName} roomScope={RoomScope.REALM} />
				</div>

			</div>
			{
				showContents &&
				<>
					{domain.Room.map((room) => (
						<div
							key={room.roomId}
							className="ml-4 py-1"># {room.roomName}</div>
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
}

const Domains = () => {
	const [activeRealm] = useContext(RealmContext);
	const [visibleDomains, setVisibleDomains] = useState<{ [key: number]: boolean }>({})

	const url = activeRealm ? `/api/realms/${activeRealm.realmId.toString()}/domains` : null
	const fetcher = (url: string) => axios.get(url).then(res => res.data);
	const { data, error, isLoading } = useSWR<GetDomainsData>(url, fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60000,
	});

	if (error) return (<>Error: {error}</>);
	if (isLoading) return (<>Loading domains..</>) // TODO: change to skeleton state

	return (
		<div className="select-none overflow-y-scroll sm:h-[100%] h-[300px] m-2 w-[100%]">
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
					<Test />
				</div>
			}
			{data?.rooms.map((room) => (
				<div key={room.roomId}>
					# {room.roomName}
				</div>
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
