"use client";

import React from "react";
import Card from "@/components/single/card";
import { MdOpenInNew } from "react-icons/md";

interface AllyEmbedViewProps {
  allyName: string;
  url: string;
}

export default function AllyEmbedView({ allyName, url }: AllyEmbedViewProps) {
  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header */}
      <Card extra="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
              {allyName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sitio web del aliado
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdOpenInNew />
            Abrir en nueva pestaña
          </a>
        </div>
      </Card>

      {/* Embedded Website */}
      <Card extra="p-8" style={{ minHeight: 'calc(100vh - 280px)' }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 flex items-center justify-center mb-4">
              <MdOpenInNew className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
              Sitio web externo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              Este sitio web no puede ser mostrado dentro de la aplicación por razones de seguridad.
              Haga clic en el botón de abajo para abrirlo en una nueva pestaña.
            </p>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-brand-500 px-8 py-4 text-lg font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 transition-colors"
          >
            <MdOpenInNew className="text-xl" />
            Abrir {allyName}
          </a>

          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            URL: {url}
          </p>
        </div>
      </Card>
    </div>
  );
}
