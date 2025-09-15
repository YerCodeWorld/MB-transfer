// BottomBar.tsx
import { HiOutlinePlus, HiOutlineCog, HiOutlineSearch, HiOutlineDownload } from "react-icons/hi";

export default function BottomBar({ section, mini = false }: { section: string; mini?: boolean }) {
  const wrap = mini ? "left-[140px]" : "left-[315px]";

  const actions: Record<string, Array<{ key: string; label: string; Icon: any }>> = {
    itinerary: [
      { key: "new", label: "New Service", Icon: HiOutlinePlus },
      { key: "search", label: "Find", Icon: HiOutlineSearch },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
    notes: [
      { key: "new", label: "New Note", Icon: HiOutlinePlus },
      { key: "search", label: "Find", Icon: HiOutlineSearch },
    ],
    people: [
      { key: "new", label: "Add", Icon: HiOutlinePlus },
      { key: "search", label: "Find", Icon: HiOutlineSearch },
    ],
    accounting: [
      { key: "new", label: "New Entry", Icon: HiOutlinePlus },
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
    stats: [
      { key: "export", label: "Export", Icon: HiOutlineDownload },
      { key: "settings", label: "Settings", Icon: HiOutlineCog },
    ],
  };

  const list = actions[section] ?? [];

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-[60vh]">
      <div className="inline-flex w-[100vh] items-center justify-center gap-4 rounded-2xl border border-accent-700 bg-white p-2 dark:bg-navy-800">
        {list.map(({ key, label, Icon }) => (
          <button
            key={key}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy-700 hover:bg-accent-50 hover:text-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400 dark:text-white"
            title={label}
          >
            <Icon className="text-lg" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

