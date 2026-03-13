import { SeenReceipt } from "@/utils/api";

interface SeenByStackProps {
  receipts?: SeenReceipt[];
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export default function SeenByStack({ receipts = [] }: SeenByStackProps) {
  if (receipts.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-gray-400">Nadie la ha visto todavía.</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {receipts.slice(0, 5).map((receipt) => (
          <div
            key={receipt.id}
            title={`${receipt.employee.name} • ${new Date(receipt.seenAt).toLocaleString("es-DO")}`}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-accent-100 text-[10px] font-semibold text-accent-700 shadow-sm dark:border-navy-800 dark:bg-accent-900/40 dark:text-accent-100"
            style={
              receipt.employee.photo
                ? {
                    backgroundImage: `url(${receipt.employee.photo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!receipt.employee.photo ? getInitials(receipt.employee.name) : null}
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Visto por {receipts.length} persona{receipts.length === 1 ? "" : "s"}
      </span>
    </div>
  );
}
