"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAlly, useCreateAlly, useUpdateAlly } from "@/hooks/useAllies";
import { toast } from "sonner";

interface AllyFormProps {
  mode: "create" | "edit";
  allyId?: string;
  onSuccess?: () => void;
}

interface AllyFormData {
  name: string;
  website: string;
  logo: string;
  email: string;
  contactNumber: string;
  notes: string;
}

export default function AllyForm({ mode, allyId, onSuccess }: AllyFormProps) {
  const { popView } = useNavigation();
  const { data: ally, isLoading: loadingAlly } = useAlly(allyId || "");
  const createAllyMutation = useCreateAlly();
  const updateAllyMutation = useUpdateAlly();

  const [formData, setFormData] = useState<AllyFormData>({
    name: "",
    website: "",
    logo: "",
    email: "",
    contactNumber: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && ally) {
      setFormData({
        name: ally.name || "",
        website: ally.website || "",
        logo: ally.logo || "",
        email: ally.email || "",
        contactNumber: ally.contactNumber || "",
        notes: ally.notes || "",
      });
    }
  }, [mode, ally]);

  const handleInputChange = (field: keyof AllyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo invalido";
    }

    if (
      formData.website &&
      !/^https?:\/\/.+/i.test(formData.website)
    ) {
      newErrors.website = "El sitio web debe iniciar con http:// o https://";
    }

    if (
      formData.logo &&
      !/^https?:\/\/.+/i.test(formData.logo)
    ) {
      newErrors.logo = "La URL del logo debe iniciar con http:// o https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      website: formData.website.trim() || undefined,
      logo: formData.logo.trim() || undefined,
      email: formData.email.trim() || undefined,
      contactNumber: formData.contactNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    try {
      if (mode === "create") {
        await createAllyMutation.mutateAsync(payload);
        toast.success("Aliado creado exitosamente");
      } else if (mode === "edit" && allyId) {
        await updateAllyMutation.mutateAsync({ id: allyId, data: payload });
        toast.success("Aliado actualizado exitosamente");
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error("Error saving ally:", error);
      toast.error(error.message || "Error al guardar aliado");
      setErrors({ submit: error.message || "Error al guardar aliado" });
    }
  };

  if (loadingAlly && mode === "edit") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando aliado...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createAllyMutation.isPending || updateAllyMutation.isPending;

  return (
    <div className="w-full h-full pb-24 px-4 overflow-y-auto">
      <Card extra="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === "create" ? "Nuevo Aliado" : "Editar Aliado"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === "create"
              ? "Complete la informacion para agregar un nuevo aliado"
              : "Actualice la informacion del aliado"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre del aliado"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Sitio Web
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                URL Logo
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Correo
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Telefono
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                placeholder="809-555-1234"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={4}
              placeholder="Notas internas sobre el aliado..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <MdSave />
              {isSubmitting ? "Guardando..." : "Guardar Aliado"}
            </button>
            <button
              type="button"
              onClick={() => popView()}
              disabled={isSubmitting}
              className="rounded-xl bg-gray-200 dark:bg-gray-700 px-6 py-3 text-sm font-semibold text-navy-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
