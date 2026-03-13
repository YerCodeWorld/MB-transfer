"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FiLoader, FiPlus, FiRefreshCw } from "react-icons/fi";
import { HiOutlinePencilAlt, HiOutlineSparkles, HiOutlineViewBoards } from "react-icons/hi";
import { PiPushPinSimple } from "react-icons/pi";

import { useAuth } from "@/contexts/AuthContext";
import { useBottomBar } from "@/contexts/BottomBarContext";
import { useServiceData } from "@/contexts/ServiceDataContext";
import { Note } from "@/types/services";
import { DeveloperNote, DeveloperNoteGroup, apiClient } from "@/utils/api";

import MessagesComposer from "./components/MessagesComposer";
import MessagesSection from "./components/MessagesSection";
import OperationalNoteCard from "./components/OperationalNoteCard";
import DeveloperNoteGroupCard from "./components/DeveloperNoteGroupCard";
import {
  canManageOperationalNote,
  formatSelectedDateLabel,
  isPrivilegedNoteRole,
  sortNotesByUpdatedAt,
  splitDeveloperGroups,
} from "./utils/messages";

type ComposerMode = "today" | "pinned" | "developer" | "group";
type MessagesTab = "today" | "pinned" | "developer" | "create";

const EMPTY_OPERATIONAL_DRAFT = {
  title: "",
  caption: "",
  content: "",
  tag: "REMINDER" as Note["tag"],
  isPinned: false,
};

const EMPTY_DEVELOPER_DRAFT = {
  title: "",
  content: "",
  type: "PATCH" as DeveloperNote["type"],
  groupId: "",
  isFeatured: false,
  isActive: true,
};

const EMPTY_GROUP_DRAFT = {
  name: "",
  versionLabel: "",
  tagLabel: "",
  color: "#4B74C5",
  isFeatured: false,
  isActive: true,
};

export default function MessagesView() {
  const { employee } = useAuth();
  const { selectedDate } = useServiceData();
  const { setActions, clearActions } = useBottomBar();

  const [todayNotes, setTodayNotes] = useState<Note[]>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>([]);
  const [developerGroups, setDeveloperGroups] = useState<DeveloperNoteGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ComposerMode>("today");
  const [editingOperational, setEditingOperational] = useState<Note | null>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperNote | null>(null);
  const [editingGroup, setEditingGroup] = useState<DeveloperNoteGroup | null>(null);
  const [operationalDraft, setOperationalDraft] = useState(EMPTY_OPERATIONAL_DRAFT);
  const [developerDraft, setDeveloperDraft] = useState(EMPTY_DEVELOPER_DRAFT);
  const [groupDraft, setGroupDraft] = useState(EMPTY_GROUP_DRAFT);
  const [activeTab, setActiveTab] = useState<MessagesTab>("today");

  const isPrivileged = isPrivilegedNoteRole(employee?.role);

  const loadMessages = useCallback(async () => {
    setError(null);

    try {
      const [todayResponse, pinnedResponse, groupsResponse] = await Promise.all([
        apiClient.getNotes({ date: selectedDate }),
        apiClient.getNotes({ pinned: true }),
        apiClient.getDeveloperNoteGroups({ active: true }),
      ]);

      setTodayNotes(sortNotesByUpdatedAt(todayResponse.data || []));
      setPinnedNotes(sortNotesByUpdatedAt(pinnedResponse.data || []));
      setDeveloperGroups(groupsResponse.data || []);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || "No se pudieron cargar los mensajes.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setIsLoading(true);
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadMessages();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    setActions([
      {
        key: "messages-today",
        label: "TODAY's Notes",
        Icon: HiOutlineViewBoards,
        variant: activeTab === "today" ? "primary" : "secondary",
        onClick: () => setActiveTab("today"),
      },
      {
        key: "messages-pinned",
        label: "Pinned Notes",
        Icon: PiPushPinSimple,
        variant: activeTab === "pinned" ? "primary" : "secondary",
        onClick: () => setActiveTab("pinned"),
      },
      {
        key: "messages-developer",
        label: "Developer Notes",
        Icon: HiOutlineSparkles,
        variant: activeTab === "developer" ? "primary" : "secondary",
        onClick: () => setActiveTab("developer"),
      },
      {
        key: "messages-create",
        label: "Create Notes",
        Icon: HiOutlinePencilAlt,
        variant: activeTab === "create" ? "primary" : "secondary",
        onClick: () => setActiveTab("create"),
      },
      {
        key: "messages-refresh",
        label: "Actualizar",
        Icon: FiRefreshCw,
        onClick: () => loadMessages(),
      },
    ]);

    return () => clearActions();
  }, [activeTab, clearActions, loadMessages, setActions]);

  const ensureItineraryId = useCallback(async () => {
    const itineraryResponse = await apiClient.getItineraryByDate(selectedDate);
    if (itineraryResponse.success && itineraryResponse.data?.id) {
      return itineraryResponse.data.id as string;
    }

    const createdResponse = await apiClient.createItinerary({ date: selectedDate });
    if (createdResponse.success && createdResponse.data?.id) {
      return createdResponse.data.id as string;
    }

    throw new Error("No se pudo preparar el itinerario para esa fecha.");
  }, [selectedDate]);

  const resetComposer = useCallback(() => {
    setEditingOperational(null);
    setEditingDeveloper(null);
    setEditingGroup(null);
    setOperationalDraft(EMPTY_OPERATIONAL_DRAFT);
    setDeveloperDraft(EMPTY_DEVELOPER_DRAFT);
    setGroupDraft(EMPTY_GROUP_DRAFT);
  }, []);

  const handleOperationalChange = useCallback(
    (field: keyof typeof EMPTY_OPERATIONAL_DRAFT, value: string | boolean | undefined) => {
      setOperationalDraft((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleDeveloperChange = useCallback(
    (field: keyof typeof EMPTY_DEVELOPER_DRAFT, value: string | boolean | undefined) => {
      setDeveloperDraft((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleGroupChange = useCallback(
    (field: keyof typeof EMPTY_GROUP_DRAFT, value: string | boolean) => {
      setGroupDraft((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleSaveOperational = useCallback(async () => {
    if (!operationalDraft.title.trim() || !operationalDraft.content.trim()) {
      toast.error("La nota necesita título y contenido.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingOperational) {
        const response = await apiClient.updateNote(editingOperational.id, {
          title: operationalDraft.title.trim(),
          caption: operationalDraft.caption.trim() || undefined,
          content: operationalDraft.content.trim(),
          tag: operationalDraft.tag,
          isPinned: mode === "pinned",
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo actualizar la nota.");
        }
      } else {
        const itineraryId = mode === "today" ? await ensureItineraryId() : undefined;
        const response = await apiClient.createNote({
          title: operationalDraft.title.trim(),
          caption: operationalDraft.caption.trim() || undefined,
          content: operationalDraft.content.trim(),
          tag: operationalDraft.tag,
          itineraryId,
          isPinned: mode === "pinned",
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo crear la nota.");
        }
      }

      toast.success(mode === "pinned" ? "Nota fijada guardada." : "Nota guardada.");
      resetComposer();
      await loadMessages();
    } catch (err: any) {
      console.error("Error saving operational note:", err);
      toast.error(err.message || "No se pudo guardar la nota.");
    } finally {
      setIsSaving(false);
    }
  }, [editingOperational, ensureItineraryId, loadMessages, mode, operationalDraft, resetComposer]);

  const handleSaveDeveloper = useCallback(async () => {
    if (!isPrivileged) {
      toast.error("Solo el administrador o developer puede crear notas developer.");
      return;
    }

    if (!developerDraft.groupId || !developerDraft.title.trim() || !developerDraft.content.trim()) {
      toast.error("La nota developer necesita paquete, título y contenido.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingDeveloper) {
        const response = await apiClient.updateDeveloperNote(editingDeveloper.id, {
          title: developerDraft.title.trim(),
          content: developerDraft.content.trim(),
          type: developerDraft.type,
          groupId: developerDraft.groupId,
          isFeatured: developerDraft.isFeatured,
          isActive: developerDraft.isActive,
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo actualizar la nota developer.");
        }
      } else {
        const response = await apiClient.createDeveloperNote({
          title: developerDraft.title.trim(),
          content: developerDraft.content.trim(),
          type: developerDraft.type,
          groupId: developerDraft.groupId,
          isFeatured: developerDraft.isFeatured,
          isActive: developerDraft.isActive,
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo crear la nota developer.");
        }
      }

      toast.success("Nota developer guardada.");
      resetComposer();
      await loadMessages();
    } catch (err: any) {
      console.error("Error saving developer note:", err);
      toast.error(err.message || "No se pudo guardar la nota developer.");
    } finally {
      setIsSaving(false);
    }
  }, [developerDraft, editingDeveloper, isPrivileged, loadMessages, resetComposer]);

  const handleSaveGroup = useCallback(async () => {
    if (!isPrivileged) {
      toast.error("Solo el administrador o developer puede gestionar paquetes.");
      return;
    }

    if (!groupDraft.name.trim()) {
      toast.error("El paquete necesita un nombre.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingGroup) {
        const response = await apiClient.updateDeveloperNoteGroup(editingGroup.id, {
          name: groupDraft.name.trim(),
          versionLabel: groupDraft.versionLabel.trim() || undefined,
          tagLabel: groupDraft.tagLabel.trim() || undefined,
          color: groupDraft.color || undefined,
          isFeatured: groupDraft.isFeatured,
          isActive: groupDraft.isActive,
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo actualizar el paquete.");
        }
      } else {
        const response = await apiClient.createDeveloperNoteGroup({
          name: groupDraft.name.trim(),
          versionLabel: groupDraft.versionLabel.trim() || undefined,
          tagLabel: groupDraft.tagLabel.trim() || undefined,
          color: groupDraft.color || undefined,
          isFeatured: groupDraft.isFeatured,
          isActive: groupDraft.isActive,
        });

        if (!response.success) {
          throw new Error(response.message || "No se pudo crear el paquete.");
        }
      }

      toast.success("Paquete developer guardado.");
      resetComposer();
      await loadMessages();
    } catch (err: any) {
      console.error("Error saving developer note group:", err);
      toast.error(err.message || "No se pudo guardar el paquete.");
    } finally {
      setIsSaving(false);
    }
  }, [editingGroup, groupDraft, isPrivileged, loadMessages, resetComposer]);

  const handleEditOperational = useCallback((note: Note) => {
    setMode(note.isPinned ? "pinned" : "today");
    setEditingOperational(note);
    setEditingDeveloper(null);
    setEditingGroup(null);
    setOperationalDraft({
      title: note.title || "",
      caption: note.caption || "",
      content: note.content || "",
      tag: note.tag || "REMINDER",
      isPinned: Boolean(note.isPinned),
    });
  }, []);

  const handleEditDeveloper = useCallback((note: DeveloperNote) => {
    setMode("developer");
    setEditingDeveloper(note);
    setEditingOperational(null);
    setEditingGroup(null);
    setDeveloperDraft({
      title: note.title || "",
      content: note.content || "",
      type: note.type || "PATCH",
      groupId: note.groupId || "",
      isFeatured: Boolean(note.isFeatured),
      isActive: Boolean(note.isActive),
    });
  }, []);

  const handleEditGroup = useCallback((group: DeveloperNoteGroup) => {
    setMode("group");
    setEditingGroup(group);
    setEditingOperational(null);
    setEditingDeveloper(null);
    setGroupDraft({
      name: group.name || "",
      versionLabel: group.versionLabel || "",
      tagLabel: group.tagLabel || "",
      color: group.color || "#4B74C5",
      isFeatured: Boolean(group.isFeatured),
      isActive: Boolean(group.isActive),
    });
  }, []);

  const handleDeleteOperational = useCallback(
    async (note: Note) => {
      if (!window.confirm(`Eliminar la nota "${note.title}"?`)) return;
      try {
        await apiClient.deleteNote(note.id);
        toast.success("Nota eliminada.");
        if (editingOperational?.id === note.id) {
          resetComposer();
        }
        await loadMessages();
      } catch (err: any) {
        console.error("Error deleting note:", err);
        toast.error(err.message || "No se pudo eliminar la nota.");
      }
    },
    [editingOperational?.id, loadMessages, resetComposer]
  );

  const handleDeleteDeveloper = useCallback(
    async (note: DeveloperNote) => {
      if (!window.confirm(`Eliminar la nota "${note.title}"?`)) return;
      try {
        await apiClient.deleteDeveloperNote(note.id);
        toast.success("Nota developer eliminada.");
        if (editingDeveloper?.id === note.id) {
          resetComposer();
        }
        await loadMessages();
      } catch (err: any) {
        console.error("Error deleting developer note:", err);
        toast.error(err.message || "No se pudo eliminar la nota developer.");
      }
    },
    [editingDeveloper?.id, loadMessages, resetComposer]
  );

  const handleDeleteGroup = useCallback(
    async (group: DeveloperNoteGroup) => {
      if (!window.confirm(`Eliminar el paquete "${group.name}"?`)) return;
      try {
        await apiClient.deleteDeveloperNoteGroup(group.id);
        toast.success("Paquete eliminado.");
        if (editingGroup?.id === group.id) {
          resetComposer();
        }
        await loadMessages();
      } catch (err: any) {
        console.error("Error deleting developer group:", err);
        toast.error(err.message || "No se pudo eliminar el paquete.");
      }
    },
    [editingGroup?.id, loadMessages, resetComposer]
  );

  const handleSeenOperational = useCallback(async (note: Note) => {
    try {
      await apiClient.markNoteSeen(note.id);
      await loadMessages();
    } catch (err: any) {
      console.error("Error marking note seen:", err);
      toast.error(err.message || "No se pudo marcar la nota como vista.");
    }
  }, [loadMessages]);

  const handleSeenDeveloper = useCallback(async (note: DeveloperNote) => {
    try {
      await apiClient.markDeveloperNoteSeen(note.id);
      await loadMessages();
    } catch (err: any) {
      console.error("Error marking developer note seen:", err);
      toast.error(err.message || "No se pudo marcar la nota como vista.");
    }
  }, [loadMessages]);

  const { featured: featuredGroups, regular: regularGroups } = useMemo(
    () => splitDeveloperGroups(developerGroups),
    [developerGroups]
  );

  const showTodayTab = activeTab === "today";
  const showPinnedTab = activeTab === "pinned";
  const showDeveloperTab = activeTab === "developer";
  const showCreateTab = activeTab === "create";

  return (
    <main className="flex w-full flex-col gap-6 p-5 pt-0 font-dm lg:p-6">
      <MessagesSection
        eyebrow="Mensajes"
        title="Centro de notas operativas y developer"
        description={`Trabajando sobre ${formatSelectedDateLabel(selectedDate)}. Las notas se actualizan automáticamente cada 30 segundos.`}
        action={
          <button
            type="button"
            onClick={() => loadMessages()}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:text-white"
          >
            <FiRefreshCw />
            Actualizar
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-accent-50 p-4 dark:bg-accent-900/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">TODAY&apos;s Notes</p>
            <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">{todayNotes.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Pinned Notes</p>
            <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">{pinnedNotes.length}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Developer Packages</p>
            <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">{developerGroups.length}</p>
          </div>
        </div>
      </MessagesSection>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-gray-200 bg-white dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-300">
            <FiLoader className="animate-spin text-xl" />
            Cargando mensajes...
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {showTodayTab ? (
            <MessagesSection
              title="TODAY's Notes"
              description="Notas operativas ligadas a la fecha de trabajo seleccionada."
              action={
                <button
                  type="button"
                  onClick={() => {
                    resetComposer();
                    setMode("today");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600"
                >
                  <FiPlus />
                  Nueva
                </button>
              }
            >
              <div className="space-y-4">
                {todayNotes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                    No hay notas para esta fecha.
                  </div>
                ) : (
                  todayNotes.map((note) => (
                    <OperationalNoteCard
                      key={note.id}
                      note={note}
                      employeeId={employee?.id}
                      canManage={canManageOperationalNote(note, employee?.id, employee?.role)}
                      onEdit={handleEditOperational}
                      onDelete={handleDeleteOperational}
                      onSeen={handleSeenOperational}
                    />
                  ))
                )}
              </div>
            </MessagesSection>
          ) : null}

          {showPinnedTab ? (
            <MessagesSection title="Pinned Notes" description="Notas globales siempre visibles para toda la operación.">
              <div className="space-y-4">
                {pinnedNotes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                    No hay notas fijadas todavía.
                  </div>
                ) : (
                  pinnedNotes.map((note) => (
                    <OperationalNoteCard
                      key={note.id}
                      note={note}
                      employeeId={employee?.id}
                      canManage={canManageOperationalNote(note, employee?.id, employee?.role)}
                      onEdit={handleEditOperational}
                      onDelete={handleDeleteOperational}
                      onSeen={handleSeenOperational}
                    />
                  ))
                )}
              </div>
            </MessagesSection>
          ) : null}

          {showDeveloperTab ? (
          <MessagesSection
            title="Developer Notes"
            description="Notas agrupadas por paquete para comunicar patches, updates o avisos importantes."
          >
            <div className="space-y-5">
              {featuredGroups.map((group) => (
                <DeveloperNoteGroupCard
                  key={group.id}
                  group={group}
                  employeeId={employee?.id}
                  canManage={isPrivileged}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onEditNote={handleEditDeveloper}
                  onDeleteNote={handleDeleteDeveloper}
                  onSeenNote={handleSeenDeveloper}
                />
              ))}
              {regularGroups.map((group) => (
                <DeveloperNoteGroupCard
                  key={group.id}
                  group={group}
                  employeeId={employee?.id}
                  canManage={isPrivileged}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onEditNote={handleEditDeveloper}
                  onDeleteNote={handleDeleteDeveloper}
                  onSeenNote={handleSeenDeveloper}
                />
              ))}
              {developerGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                  No hay notas developer todavía.
                </div>
              ) : null}
            </div>
          </MessagesSection>
          ) : null}

          {showCreateTab ? (
          <MessagesSection
            title="Create Notes"
            description="Crea notas operativas, notas fijadas y publicaciones developer desde un solo lugar."
          >
            <MessagesComposer
              mode={mode}
              onModeChange={(nextMode) => {
                resetComposer();
                setMode(nextMode);
              }}
              canManagePinned={isPrivileged}
              canManageDeveloper={isPrivileged}
              operationalDraft={operationalDraft}
              developerDraft={developerDraft}
              groupDraft={groupDraft}
              groups={developerGroups}
              onOperationalChange={handleOperationalChange}
              onDeveloperChange={handleDeveloperChange}
              onGroupChange={handleGroupChange}
              onSaveOperational={handleSaveOperational}
              onSaveDeveloper={handleSaveDeveloper}
              onSaveGroup={handleSaveGroup}
              onCancelEdit={resetComposer}
              editingOperational={editingOperational}
              editingDeveloper={editingDeveloper}
              editingGroup={editingGroup}
              isSaving={isSaving}
            />
          </MessagesSection>
          ) : null}
        </div>
      )}
    </main>
  );
}
