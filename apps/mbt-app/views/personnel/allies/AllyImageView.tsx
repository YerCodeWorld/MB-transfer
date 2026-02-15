"use client";

import React from "react";
import Card from "@/components/single/card";

interface AllyImageViewProps {
  allyName: string;
  imagePath: string;
}

export default function AllyImageView({ allyName, imagePath }: AllyImageViewProps) {
  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header */}
      <Card extra="p-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {allyName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Información del aliado
          </p>
        </div>
      </Card>

      {/* Image Display */}
      <Card extra="p-6">
        <div className="flex items-center justify-center">
          <img
            src={imagePath}
            alt={allyName}
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </Card>
    </div>
  );
}
