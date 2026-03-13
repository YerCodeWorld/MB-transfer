import Card from "@/components/single/card";
import { ReactNode } from "react";

interface MessagesSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function MessagesSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: MessagesSectionProps) {
  return (
    <Card extra="h-full rounded-[24px] p-6 dark:bg-navy-800">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-white/10">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-500">{eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-xl font-bold text-navy-700 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
