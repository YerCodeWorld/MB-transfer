import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { PiPushPinSimple } from "react-icons/pi";
import { Note } from "@/types/services";
import SeenByStack from "./SeenByStack";
import {
  NOTE_TAG_LABELS,
  formatMessageDate,
  getOperationalTagClasses,
  hasSeenNote,
} from "../utils/messages";

interface OperationalNoteCardProps {
  note: Note;
  employeeId?: string;
  canManage: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onSeen: (note: Note) => void;
}

export default function OperationalNoteCard({
  note,
  employeeId,
  canManage,
  onEdit,
  onDelete,
  onSeen,
}: OperationalNoteCardProps) {
  const alreadySeen = hasSeenNote(note.seenBy, employeeId);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-navy-900/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getOperationalTagClasses(note.tag)}`}>
              {NOTE_TAG_LABELS[note.tag || "REMINDER"] || note.tag}
            </span>
            {note.isPinned ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-700 dark:border-accent-900/50 dark:bg-accent-900/30 dark:text-accent-100">
                <PiPushPinSimple className="text-[10px]" />
                Fijada
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-bold text-navy-700 dark:text-white">{note.title}</h3>
          {note.caption ? (
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{note.caption}</p>
          ) : null}
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-gray-300"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note)}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:text-gray-300"
            >
              <FiTrash2 />
            </button>
          </div>
        ) : null}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{note.content}</p>

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
            onClick={() => onSeen(note)}
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
}
