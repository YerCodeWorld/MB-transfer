import { DeveloperNote, DeveloperNoteGroup } from "@/utils/api";
import { Note } from "@/types/services";
import { NOTE_TAG_LABELS } from "../utils/messages";

type ComposerMode = "today" | "pinned" | "developer" | "group";

interface OperationalDraft {
  title: string;
  caption: string;
  content: string;
  tag: Note["tag"];
  isPinned: boolean;
}

interface DeveloperDraft {
  title: string;
  content: string;
  type: DeveloperNote["type"];
  groupId: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface GroupDraft {
  name: string;
  versionLabel: string;
  tagLabel: string;
  color: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface MessagesComposerProps {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  canManagePinned: boolean;
  canManageDeveloper: boolean;
  operationalDraft: OperationalDraft;
  developerDraft: DeveloperDraft;
  groupDraft: GroupDraft;
  groups: DeveloperNoteGroup[];
  onOperationalChange: (field: keyof OperationalDraft, value: string | boolean | undefined) => void;
  onDeveloperChange: (field: keyof DeveloperDraft, value: string | boolean | undefined) => void;
  onGroupChange: (field: keyof GroupDraft, value: string | boolean) => void;
  onSaveOperational: () => void;
  onSaveDeveloper: () => void;
  onSaveGroup: () => void;
  onCancelEdit: () => void;
  editingOperational?: Note | null;
  editingDeveloper?: DeveloperNote | null;
  editingGroup?: DeveloperNoteGroup | null;
  isSaving: boolean;
}

const TAG_OPTIONS = Object.entries(NOTE_TAG_LABELS);
const DEVELOPER_TYPES: DeveloperNote["type"][] = ["PATCH", "UPDATE", "WARNING", "INFO"];

export default function MessagesComposer({
  mode,
  onModeChange,
  canManagePinned,
  canManageDeveloper,
  operationalDraft,
  developerDraft,
  groupDraft,
  groups,
  onOperationalChange,
  onDeveloperChange,
  onGroupChange,
  onSaveOperational,
  onSaveDeveloper,
  onSaveGroup,
  onCancelEdit,
  editingOperational,
  editingDeveloper,
  editingGroup,
  isSaving,
}: MessagesComposerProps) {
  const modes: Array<{ key: ComposerMode; label: string; hidden?: boolean }> = [
    { key: "today", label: "Nota del día" },
    { key: "pinned", label: "Nota fijada", hidden: !canManagePinned },
    { key: "developer", label: "Nota developer", hidden: !canManageDeveloper },
    { key: "group", label: "Paquete developer", hidden: !canManageDeveloper },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {modes
          .filter((entry) => !entry.hidden)
          .map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => onModeChange(entry.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === entry.key
                  ? "bg-accent-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-accent-50 hover:text-accent-700 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-accent-900/30"
              }`}
            >
              {entry.label}
            </button>
          ))}
      </div>

      {(editingOperational || editingDeveloper || editingGroup) ? (
        <button
          type="button"
          onClick={onCancelEdit}
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-gray-300"
        >
          Cancelar edición
        </button>
      ) : null}

      {(mode === "today" || mode === "pinned") && (
        <div className="space-y-4">
          <input
            value={operationalDraft.title}
            onChange={(event) => onOperationalChange("title", event.target.value)}
            placeholder="Título"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <input
            value={operationalDraft.caption}
            onChange={(event) => onOperationalChange("caption", event.target.value)}
            placeholder="Subtítulo opcional"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <select
            value={operationalDraft.tag || "REMINDER"}
            onChange={(event) => onOperationalChange("tag", event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          >
            {TAG_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            value={operationalDraft.content}
            onChange={(event) => onOperationalChange("content", event.target.value)}
            rows={7}
            placeholder="Escribe la nota..."
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <button
            type="button"
            onClick={onSaveOperational}
            disabled={isSaving}
            className="w-full rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {editingOperational ? "Actualizar nota" : mode === "pinned" ? "Crear nota fijada" : "Crear nota"}
          </button>
        </div>
      )}

      {mode === "developer" && canManageDeveloper && (
        <div className="space-y-4">
          <select
            value={developerDraft.groupId}
            onChange={(event) => onDeveloperChange("groupId", event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          >
            <option value="">Selecciona un paquete</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <input
            value={developerDraft.title}
            onChange={(event) => onDeveloperChange("title", event.target.value)}
            placeholder="Título"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <select
            value={developerDraft.type}
            onChange={(event) => onDeveloperChange("type", event.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          >
            {DEVELOPER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <textarea
            value={developerDraft.content}
            onChange={(event) => onDeveloperChange("content", event.target.value)}
            rows={7}
            placeholder="Contenido de la nota developer..."
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:text-gray-200">
            <input
              type="checkbox"
              checked={developerDraft.isFeatured}
              onChange={(event) => onDeveloperChange("isFeatured", event.target.checked)}
            />
            Marcar como featured
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:text-gray-200">
            <input
              type="checkbox"
              checked={developerDraft.isActive}
              onChange={(event) => onDeveloperChange("isActive", event.target.checked)}
            />
            Mantener activa
          </label>
          <button
            type="button"
            onClick={onSaveDeveloper}
            disabled={isSaving}
            className="w-full rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {editingDeveloper ? "Actualizar nota developer" : "Crear nota developer"}
          </button>
        </div>
      )}

      {mode === "group" && canManageDeveloper && (
        <div className="space-y-4">
          <input
            value={groupDraft.name}
            onChange={(event) => onGroupChange("name", event.target.value)}
            placeholder="Nombre del paquete"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <input
            value={groupDraft.versionLabel}
            onChange={(event) => onGroupChange("versionLabel", event.target.value)}
            placeholder="Versión, ejemplo v2.5.0"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <input
            value={groupDraft.tagLabel}
            onChange={(event) => onGroupChange("tagLabel", event.target.value)}
            placeholder="Tag personalizada"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
          />
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={groupDraft.color}
              onChange={(event) => onGroupChange("color", event.target.value)}
              placeholder="#4B74C5"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent-400 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
            <input
              type="color"
              value={groupDraft.color || "#4B74C5"}
              onChange={(event) => onGroupChange("color", event.target.value)}
              className="h-[52px] w-full rounded-2xl border border-gray-200 bg-transparent px-2 dark:border-white/10"
            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:text-gray-200">
            <input
              type="checkbox"
              checked={groupDraft.isFeatured}
              onChange={(event) => onGroupChange("isFeatured", event.target.checked)}
            />
            Marcar paquete como featured
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:text-gray-200">
            <input
              type="checkbox"
              checked={groupDraft.isActive}
              onChange={(event) => onGroupChange("isActive", event.target.checked)}
            />
            Mantener paquete activo
          </label>
          <button
            type="button"
            onClick={onSaveGroup}
            disabled={isSaving}
            className="w-full rounded-2xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {editingGroup ? "Actualizar paquete" : "Crear paquete"}
          </button>
        </div>
      )}
    </div>
  );
}
