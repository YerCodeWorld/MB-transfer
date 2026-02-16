"use client";

import React from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDelete,
  MdBusiness,
  MdLanguage,
  MdEmail,
  MdPhone,
  MdStickyNote2,
  MdAssignment,
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAlly, useDeleteAlly } from "@/hooks/useAllies";
import AllyForm from "./AllyForm";
import { toast } from "sonner";

interface AllyDetailProps {
  allyId: string;
  onUpdate?: () => void;
}

export default function AllyDetail({ allyId, onUpdate }: AllyDetailProps) {
  const { pushView, popView } = useNavigation();
  const { data: ally, isLoading, error, refetch } = useAlly(allyId);
  const deleteAllyMutation = useDeleteAlly();

  const handleEdit = () => {
    if (!ally) return;

    pushView({
      id: `ally-edit-${ally.id}`,
      label: `Editar ${ally.name}`,
      component: AllyForm,
      data: {
        mode: "edit",
        allyId: ally.id,
        onSuccess: () => {
          refetch();
          onUpdate?.();
        },
      },
    });
  };

  const handleDelete = async () => {
    if (!ally) return;

    if ((ally.services?.length || 0) > 0) {
      toast.error("No se puede eliminar un aliado con servicios asociados");
      return;
    }

    const confirmed = window.confirm(
      `¿Esta seguro que desea eliminar el aliado \"${ally.name}\"? Esta accion no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await deleteAllyMutation.mutateAsync(ally.id);
      toast.success("Aliado eliminado exitosamente");
      onUpdate?.();
      popView();
    } catch (err: any) {
      console.error("Error deleting ally:", err);
      toast.error(err.message || "Error al eliminar aliado");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando aliado...</p>
        </div>
      </div>
    );
  }

  if (error || !ally) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : "Aliado no encontrado"}
          </p>
          <button
            onClick={() => popView()}
            className="mt-4 rounded-xl bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Volver
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 pb-24 overflow-y-auto">
      <Card extra="p-6 mb-6 !rounded-md !shadow-[0_14px_35px_rgba(15,23,42,0.14)] border border-gray-200 dark:border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-md bg-gradient-to-br from-accent-500 to-accent-700 dark:from-accent-400 dark:to-accent-600">
              <MdBusiness className="text-4xl text-black dark:text-white" />
              <div className="absolute -left-2 top-2 h-10 w-1 bg-accent-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">{ally.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Creado el {new Date(ally.createdAt).toLocaleDateString("es-DO")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <MdEdit />
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteAllyMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <MdDelete />
              {deleteAllyMutation.isPending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Informacion de Contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MdLanguage className="text-base" />
              <span>{ally.website || "Sin sitio web"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MdEmail className="text-base" />
              <span>{ally.email || "Sin correo"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MdPhone className="text-base" />
              <span>{ally.contactNumber || "Sin telefono"}</span>
            </div>
          </div>
        </Card>

        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Resumen</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdAssignment className="text-base" />
                Servicios registrados
              </div>
              <span className="text-lg font-bold text-brand-500 dark:text-brand-400">
                {ally.services?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdStickyNote2 className="text-base" />
                Observaciones
              </div>
              <span className="text-lg font-bold text-navy-700 dark:text-white">
                {ally.observations?.length || 0}
              </span>
            </div>
          </div>
        </Card>

        {ally.notes && (
          <Card extra="p-6 md:col-span-2 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Notas</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ally.notes}</p>
          </Card>
        )}

        {ally.services?.length > 0 && (
          <Card extra="p-6 md:col-span-2 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Ultimos Servicios</h3>
            <div className="space-y-2">
              {ally.services.slice(0, 8).map((service: any) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-gray-200 dark:border-white/10 p-3 bg-gray-50 dark:bg-navy-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-700 dark:text-white">
                      {service.code || "Sin codigo"} - {service.clientName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(service.pickupTime).toLocaleDateString("es-DO")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {service.pickup?.name || "Origen"} {"->"} {service.dropoff?.name || "Destino"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
