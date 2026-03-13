import { DeveloperNote, DeveloperNoteGroup } from "@/utils/api";
import { Note } from "@/types/services";

export const NOTE_TAG_LABELS: Record<string, string> = {
  EMERGENCY: "Emergencia",
  IMPORTANT: "Importante",
  REMINDER: "Recordatorio",
  MINOR: "Menor",
  IDEA: "Idea",
  SUGGESTION: "Sugerencia",
};

export const DEVELOPER_NOTE_TYPE_LABELS: Record<string, string> = {
  PATCH: "Patch",
  UPDATE: "Update",
  WARNING: "Warning",
  INFO: "Info",
};

export const isPrivilegedNoteRole = (role?: string | null) =>
  role === "ADMINISTRATOR" || role === "DEVELOPER";

export const canManageOperationalNote = (note: Note, employeeId?: string, role?: string | null) => {
  if (!employeeId) return false;
  if (isPrivilegedNoteRole(role)) return true;
  return note.createdBy?.id === employeeId;
};

export const hasSeenNote = (
  receipts: Array<{ employee: { id: string } }> | undefined,
  employeeId?: string
) => Boolean(employeeId && receipts?.some((receipt) => receipt.employee.id === employeeId));

export const formatMessageDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-DO", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatSelectedDateLabel = (value: string) =>
  new Date(value).toLocaleDateString("es-DO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const getOperationalTagClasses = (tag?: string) => {
  switch (tag) {
    case "EMERGENCY":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200";
    case "IMPORTANT":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200";
    case "MINOR":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "IDEA":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200";
    case "SUGGESTION":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-200";
    default:
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200";
  }
};

export const getDeveloperTypeClasses = (type?: string) => {
  switch (type) {
    case "PATCH":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200";
    case "UPDATE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "WARNING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200";
  }
};

export const getGroupAccentStyle = (group: DeveloperNoteGroup) => ({
  borderColor: group.color || "#4B74C5",
  background: `${group.color || "#4B74C5"}14`,
});

export const sortNotesByUpdatedAt = <T extends { updatedAt: string }>(notes: T[]) =>
  [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const splitDeveloperGroups = (groups: DeveloperNoteGroup[]) => {
  const featured = groups.filter((group) => group.isFeatured);
  const regular = groups.filter((group) => !group.isFeatured);
  return { featured, regular };
};

export const isDeveloperNoteActive = (note: DeveloperNote) => {
  if (!note.isActive) return false;
  const now = Date.now();
  const startsAt = note.startsAt ? new Date(note.startsAt).getTime() : null;
  const expiresAt = note.expiresAt ? new Date(note.expiresAt).getTime() : null;
  if (startsAt && startsAt > now) return false;
  if (expiresAt && expiresAt < now) return false;
  return true;
};
