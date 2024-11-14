import RealmContext from "@/context/RealmContext";
import { Domain, Permissions } from "@prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import useSWR from "swr";
import CreateDomain from "./CreateDomain";
import DeleteDomain from "./DeleteDomain";
import PatchDomain from "./PatchDomain";

type PermissionedDomain = Domain & {
	DomainPermissions: Permissions[]
}

export type OptionallyParentalDomain = PermissionedDomain & {
	children: OptionallyParentalDomain[]
}

type GetDomainsData = {
	success: boolean,
	domains: OptionallyParentalDomain[]
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
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div className={`${depth === 0 ? "mt-6" : "ml-8 mt-2"}`}>
			<div className="flex"
				onMouseOver={() => setShowOptions(true)}
				onMouseLeave={() => setShowOptions(false)}>
				<div
					className="hover:cursor-pointer hover:dark:brightness-90 flex"
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
					<span className="font-bold text-xs dark:text-slate-400 text-slate-500"
					>{domain.domainName}</span>
				</div>
				{showOptions &&
					<>
						{depth < 2 &&
							<CreateDomain parentDomainName={domain.domainName} parentDomainId={domain.domainId} />}
						<DeleteDomain domainId={domain.domainId} domainName={domain.domainName} />
						<PatchDomain parentDomainName={parentDomainName} domain={domain} domains={domains} />
					</>}

			</div>
			{showContents &&
				<>
					<div className="ml-4 py-1"># example-room</div>
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
		</div>
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
		<div className="select-none overflow-y-scroll sm:h-[100%] h-[300px] m-2">
			<CreateDomain parentDomainName={null} parentDomainId={null}>
				<span className="font-bold text-xs dark:text-slate-400 text-slate-500"
				>Create new domain</span>
			</CreateDomain>
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
