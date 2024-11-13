import RealmContext from "@/context/RealmContext";
import { Domain, Permissions } from "@prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import useSWR from "swr";

type PermissionedDomain = Domain & {
	DomainPermissions: Permissions[]
}

type OptionallyParentalDomain = PermissionedDomain & {
	children: OptionallyParentalDomain[]
}

type GetDomainsData = {
	success: boolean,
	domains: OptionallyParentalDomain[]
}

interface DomainItemProps {
	domain: OptionallyParentalDomain,
	depth: number,
	visibleDomains: { [key: number]: boolean },
	setVisibleDomains: Dispatch<SetStateAction<{
		[key: number]: boolean;
	}>>
}

const DomainItem = ({
	domain,
	depth,
	visibleDomains,
	setVisibleDomains
}: DomainItemProps) => {
	const showContents = visibleDomains[domain.domainId] ?? true;

	return (
		<div className={`${depth === 0 ? "pt-8" : "ml-8 mt-2"}`}>
			<div
				className="hover:cursor-pointer hover:dark:brightness-90 hover:underline flex"
				onClick={() => setVisibleDomains(curr => {
					return {
						...curr,
						[domain.domainId]: !showContents
					}
				})}
			>
				<div className="translate-y-[2px]"
				>{showContents ? <FaAngleDown size={"1em"} /> : <FaAngleRight />}</div>
				{domain.domainName}
			</div>
			{showContents &&
				<>
					<div className="ml-4"># example-room</div>
					{domain.children.map((childDomain) =>
						<DomainItem
							visibleDomains={visibleDomains}
							setVisibleDomains={setVisibleDomains}
							key={childDomain.domainId}
							domain={childDomain}
							depth={depth + 1} />)}
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
	if (isLoading) return (<>Loading domains..</>)

	return (
		<div className="select-none">
			{data?.domains.map((domain) => {
				return (
					<DomainItem
						key={domain.domainId}
						domain={domain}
						visibleDomains={visibleDomains}
						setVisibleDomains={setVisibleDomains}
						depth={0} />
				);
			})}
		</div>
	);
}

export default Domains;
