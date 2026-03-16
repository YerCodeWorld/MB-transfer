import { WorkdayStatus } from "../types";

type TimelineStyles = {
	accent: string;
	soft: string;
	text: string;
	border: string;
	rail: string;
	badge: string;
}

export const STATUS_TABS: Array<{ key: WorkdayStatus; label: string; description: string }> = [
	{ key: "past", label: "Pasados", description: "Servicios que ya debieron cerrarse." },
	{ key: "ongoing", label: "En curso", description: "Operaciones activas para seguimiento inmediato." },
	{ key: "upcoming", label: "Próximos", description: "Asignaciones y preparación de salida." },
];

export const STATUS_STYLES: Record<WorkdayStatus, TimelineStyles> = {
	past: {
		accent: "bg-slate-600",
		soft: "bg-slate-100 dark:bg-slate-900/40",
		text: "text-slate-700 dark:text-slate-100",
		border: "border-slate-200 dark:border-slate-800",
		rail: "from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800",
		badge: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-100",
	},
	ongoing: {
		accent: "bg-emerald-600",
		soft: "bg-emerald-50 dark:bg-emerald-900/20",
		text: "text-emerald-700 dark:text-emerald-100",
		border: "border-emerald-200 dark:border-emerald-900/50",
		rail: "from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900/40 dark:via-emerald-500/70 dark:to-emerald-900/40",
		badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100",
	},
	upcoming: {
		accent: "bg-sky-600",
		soft: "bg-sky-50 dark:bg-sky-900/20",
		text: "text-sky-700 dark:text-sky-100",
		border: "border-sky-200 dark:border-sky-900/50",
		rail: "from-sky-200 via-sky-400 to-sky-200 dark:from-sky-900/40 dark:via-sky-500/70 dark:to-sky-900/40",
		badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100",
	},
};


