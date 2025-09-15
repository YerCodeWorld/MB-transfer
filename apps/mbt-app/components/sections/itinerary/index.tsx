"use client";

import { useState } from "react";
import Image from "next/image";

type CompanyKey = "AT" | "ST" | "MBT" | "ALL";

export default function Transactions({
  date: controlledDate,
  onDateChange,
  onOpen,
}: {
  date?: string;
  onDateChange?: (d: string) => void;
  onOpen?: (k: CompanyKey) => void;
}) {
  const [date, setDate] = useState(
    controlledDate ?? new Date().toISOString().slice(0, 10)
  );

  const items: Array<{
    key: CompanyKey;
    title: string;
    desc: string;
    img: string;
  }> = [
    {
      key: "AT",
      title: "AirportTransfer",
      desc: "Get AT's data intercepting their API response endpoint",
      img: "/at-website.png",
    },
    {
      key: "ST",
      title: "Sacbé Transfer",
      desc: "Update ST's services by providing the corresponding XLSX file",
      img: "/st-website.png",
    },
    {
      key: "MBT",
      title: "MB Transfer",
      desc: "Manually add MBT's services using a form",
      img: "/mbt-website.png",
    },
    {
      key: "ALL",
      title: "All Services",
      desc: "Manage all the services created with the other tools",
      img: "/all.jpg",
    },
  ];

  const handleDate = (v: string) => {
    setDate(v);
    onDateChange?.(v);
  };

  return (
    <section className="m-10 grid gap-4 xl:grid-cols-[1fr_320px]">
      {/* MAIN */}
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy-700 dark:text-white">
            Fuentes de Datos
          </h2>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDate(e.target.value)}
            className="input input-bordered input-sm w-auto bg-white/80 dark:bg-accent-50"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={() => onOpen?.(i.key)}
              className="group relative isolate overflow-hidden border border-accent-700/30 bg-white/70 p-0 text-left shadow-sm backdrop-blur transition hover:shadow-[0_18px_40px_rgba(112,144,176,0.22)] focus:outline-none focus:ring-2 focus:ring-accent-400 dark:border-white/10 dark:bg-navy-800/60"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={i.img}
                  alt={i.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-300 ease-out group-hover:scale-105"
                />
                {/* gradient + accent edge */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-accent-700" />
              </div>

              <div className="relative flex flex-col gap-1 p-4">
                <h3 className="text-base font-semibold text-navy-700 dark:text-white">
                  {i.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-accent-50">
                  {i.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="rounded-2xl border border-accent-700/30 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-navy-800/60 xl:sticky xl:top-24">
        <header className="mb-3 border-b border-accent-700/30 pb-2 dark:border-white/10">
          <h4 className="text-sm font-semibold text-navy-700 dark:text-white">
            Itinerary — <span className="text-accent-700">{date}</span>
          </h4>
        </header>

        {/* quick stats (placeholders; wire to real data later) */}
        <dl className="space-y-3 text-sm">
          <Stat label="Total services" value="28" />
          <Stat label="AT (API)" value="11" />
          <Stat label="ST (XLSX)" value="7" />
          <Stat label="MBT (Manual)" value="10" />
        </dl>

        {/* progress sample */}
        <div className="mt-4">
          <p className="mb-1 text-xs text-gray-500 dark:text-accent-50">
            Completion
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-accent-700" />
          </div>
        </div>
      </aside>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-600 dark:text-accent-50">{label}</dt>
      <dd className="font-semibold text-navy-700 dark:text-white">{value}</dd>
    </div>
  );
}

