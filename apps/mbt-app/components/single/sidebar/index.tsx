import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

import Image from "next/image";
import logo from "../../../public/layout/ConfiguratorLogo.png";
import Card from "../card";

import { HiX, HiOutlineCalendar, HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar, HiOutlineClock } from "react-icons/hi";
type ItemKey = "live" | "workday" | "itinerary" | "notes" | "employees" | "accounting" | "stats";

function Sidebar(props: {
	open: boolean;
	onClose: () => void;
	variant?: string;
	mini?: boolean;
	hovered?: boolean;
	setHovered?: (v: boolean) => void;
	activeKey?: ItemKey;                  // controlled (optional)
	onSelect?: (k: ItemKey) => void;      // notify parent (optional)
	[x: string]: any;
}) {
	const { open, onClose, variant, mini, activeKey, onSelect } = props;

	const [localActive, setLocalActive] = useState<ItemKey>("itinerary");
	const active = activeKey ?? localActive;

	const { employee } = useAuth();

	const expanded = !mini;

	const menu: Array<{ key: ItemKey; label: string; Icon: any; title?: string }> = [
		{ key: "workday", label: "Jornada", Icon: HiOutlineClock },
		{ key: "itinerary", label: "Servicios", Icon: HiOutlineCalendar, title: "Drives / services" },
		{ key: "employees", label: "Personal", Icon: HiOutlineUsers },
		{ key: "accounting",label: "Contabilidad", Icon: HiOutlineBriefcase },
		{ key: "stats",     label: "Estadísticas", Icon: HiOutlineChartBar },
	];

	const handleSelect = (k: ItemKey) => {
		setLocalActive(k);
		onSelect?.(k);
	};

	return (
		<>
			{open && (
				<button
					className="fixed inset-0 z-[65] bg-black/35 xl:hidden"
					onClick={onClose}
					aria-label="Close sidebar overlay"
				/>
			)}

				<div
					className={
						`${mini === false ? "w-[285px]" : "w-[285px] xl:!w-[120px]"} 
					duration-175 linear fixed inset-y-0 left-0 z-[70] min-h-full transition-all md:z-[70] lg:z-[70] xl:!z-0 
					${variant === "auth" ? "xl:hidden" : "xl:block"} 
					${open ? "translate-x-0" : "-translate-x-[105%]"} xl:translate-x-0`
					}
				>
				<Card extra="mx-2 my-2 flex h-[calc(100vh-16px)] w-full flex-col !rounded-[20px] xl:ml-3 xl:mr-4 xl:my-4 xl:h-[96.5vh]">
				{/* Header */}
				<header className="m-2 flex items-center justify-between px-3 py-2">

				  <div className={`flex items-center gap-2 ${expanded ? "justify-start" : "mx-auto"}`}>
				    <Image src={logo} alt="App logo" className={`${expanded ? "h-full w-full" : "h-12 w-auto"}`} />
				  </div>

				  {/* Close (mobile) HASNT BEEN TESTED*/}
				  <span
				    onClick={onClose}
				    className="xl:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-navy-700 hover:bg-accent-50 hover:text-accent-700 dark:text-white"
				    role="button"
				    aria-label="Close sidebar"
				  >
				    <HiX className="text-lg" />
				  </span>
				</header>

				{/* Nav */}
				<nav className={`flex-1 overflow-y-auto px-2 py-3 ${expanded ? "pt-5" : "pt-8 xl:pt-[20vh]"}`} role="navigation" aria-label="Main">
				  <ul className={`flex flex-col ${expanded ? "gap-2" : "gap-7 xl:gap-10"}`}>
				    {menu.map(({ key, label, Icon, title }) => {
				      const isActive = active === key;
				      return (
					<li key={key}>
					  <button
					    title={!expanded ? (title ?? label) : undefined}
					    onClick={() => handleSelect(key)}
					    aria-current={isActive ? "page" : undefined}
					    className={[
					      "group w-full select-none rounded-xl px-3 py-2 transition",
					      expanded ? "flex items-center gap-3 justify-start" : "flex items-center justify-center",
					      isActive
						? "bg-accent-50 text-accent-700 dark:bg-accent-800/20 dark:text-accent-100 border-l-4 border-accent-700"
						: "text-navy-700 hover:bg-accent-50 hover:text-accent-700 dark:text-white/90 dark:hover:bg-white/10",
					      "focus:outline-none focus:ring-2 focus:ring-accent-400",
					    ].join(" ")}
					  >
					    <Icon className={expanded ? "text-xl shrink-0" : "text-2xl"} />
					    {expanded && (
					      <span className="truncate text-sm font-medium">{label}</span>
					    )}
					  </button>
					</li>
				      );
				    })}
				  </ul>
				</nav>

				{/* Footer */}
				<footer className="px-3 pb-3 pt-2">
				  <div className="mb-2 flex items-center justify-center gap-3">
				    <div className="h-12 w-12 overflow-hidden rounded-full bg-accent-100">
				      <Image src={employee.photo} width={40} height={40} alt={employee.name[0]} className="h-full w-full object-cover"/>
				    </div>
				    {expanded && (
				      <div className="ml-1">
					<h4 className="text-base font-bold text-navy-700 dark:text-white">{employee.name}</h4>
					<p className="text-sm font-medium text-gray-600 dark:text-accent-50">{employee.role}</p>
				      </div>
				    )}
				  </div>
				</footer>
				</Card>
			</div>
		</>
	);
}

export default Sidebar;
