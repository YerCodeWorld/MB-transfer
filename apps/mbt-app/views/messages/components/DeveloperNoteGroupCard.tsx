import { DeveloperNote, DeveloperNoteGroup } from "@/utils/api";
import { FiEdit2, FiEye, FiStar, FiTrash2 } from "react-icons/fi";
import SeenByStack from "./SeenByStack";
import {
  DEVELOPER_NOTE_TYPE_LABELS,
  formatMessageDate,
  getDeveloperTypeClasses,
  getGroupAccentStyle,
  hasSeenNote,
  isDeveloperNoteActive,
} from "../utils/messages";

interface DeveloperNoteGroupCardProps {
  group: DeveloperNoteGroup;
  employeeId?: string;
  canManage: boolean;
  onEditGroup: (group: DeveloperNoteGroup) => void;
  onDeleteGroup: (group: DeveloperNoteGroup) => void;
  onEditNote: (note: DeveloperNote) => void;
  onDeleteNote: (note: DeveloperNote) => void;
  onSeenNote: (note: DeveloperNote) => void;
}

export default function DeveloperNoteGroupCard({
  group,
  employeeId,
  canManage,
  onEditGroup,
  onDeleteGroup,
  onEditNote,
  onDeleteNote,
  onSeenNote,
}: DeveloperNoteGroupCardProps) {
  const accentStyle = getGroupAccentStyle(group);
  const notes = group.notes || [];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-navy-900/40">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-white/10" style={accentStyle}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">{group.name}</h3>
              {group.versionLabel ? (
                <span className="rounded-full border border-white/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-700 dark:text-white">
                  {group.versionLabel}
                </span>
              ) : null}
              {group.tagLabel ? (
                <span className="rounded-full border border-white/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-700 dark:text-white">
                  {group.tagLabel}
                </span>
              ) : null}
              {group.isFeatured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-700 dark:text-white">
                  <FiStar className="text-[10px]" />
                  Featured
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-navy-700/80 dark:text-white/80">
              {notes.length} nota{notes.length === 1 ? "" : "s"} en este paquete.
            </p>
          </div>
          {canManage ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditGroup(group)}
                className="rounded-xl border border-white/60 p-2 text-navy-700 transition hover:bg-white/60 dark:text-white"
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                onClick={() => onDeleteGroup(group)}
                className="rounded-xl border border-white/60 p-2 text-navy-700 transition hover:bg-white/60 dark:text-white"
              >
                <FiTrash2 />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
            Este paquete todavía no tiene notas.
          </div>
        ) : (
          notes.map((note) => {
            const alreadySeen = hasSeenNote(note.seenBy, employeeId);
            const active = isDeveloperNoteActive(note);

            return (
              <article key={note.id} className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getDeveloperTypeClasses(note.type)}`}>
                        {DEVELOPER_NOTE_TYPE_LABELS[note.type]}
                      </span>
                      {note.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-700 dark:border-accent-900/50 dark:bg-accent-900/30 dark:text-accent-100">
                          <FiStar className="text-[10px]" />
                          Featured
                        </span>
                      ) : null}
                      {!active ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
                          Inactiva
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-3 text-base font-bold text-navy-700 dark:text-white">{note.title}</h4>
                  </div>
                  {canManage ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditNote(note)}
                        className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-gray-300"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note)}
                        className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:text-gray-300"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ) : null}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{note.content}</p>

                <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span>{note.createdBy?.name || "Sistema"}</span>
                      <span className="mx-2">•</span>
                      <span>{formatMessageDate(note.updatedAt)}</span>
                    </div>
                    <button
                      type="button"
                      disabled={alreadySeen}
                      onClick={() => onSeenNote(note)}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-navy-700 transition hover:border-accent-300 hover:text-accent-600 disabled:cursor-default disabled:opacity-60 dark:border-white/10 dark:text-white"
                    >
                      <FiEye />
                      {alreadySeen ? "Ya vista" : "Marcar como vista"}
                    </button>
                  </div>
                  <SeenByStack receipts={note.seenBy} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
