"use client";

import React from "react";
import Card from "@/components/single/card";
import { MdBusiness, MdAirplanemodeActive } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";

import AllyEmbedView from "./AllyEmbedView";
import AllyImageView from "./AllyImageView";

const ALLIES = [
  {
    id: 'airport-transfer',
    name: 'Airport Transfer',
    type: 'website',
    url: 'https://airporttransfer.com',
    icon: MdAirplanemodeActive,
  },
  {
    id: 'sacbe-transfer',
    name: 'Sacbé Transfer',
    type: 'image',
    imagePath: '/st-website.png',
    icon: MdBusiness,
  },
];

export default function AlliesGrid() {
  const { pushView } = useNavigation();

  const handleViewAlly = (ally: typeof ALLIES[0]) => {
    if (ally.type === 'website') {
      pushView({
        id: `ally-view-${ally.id}`,
        label: ally.name,
        component: AllyEmbedView,
        data: { allyName: ally.name, url: ally.url },
      });
    } else if (ally.type === 'image') {
      pushView({
        id: `ally-view-${ally.id}`,
        label: ally.name,
        component: AllyImageView,
        data: { allyName: ally.name, imagePath: ally.imagePath },
      });
    }
  };

  return (
    <div className="w-full h-full px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
          Aliados
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Nuestras empresas asociadas de transporte
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
        {ALLIES.map((ally) => {
          const Icon = ally.icon;

          return (
            <Card
              key={ally.id}
              extra="p-8 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02]"
              onClick={() => handleViewAlly(ally)}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 mx-auto mb-6">
                <Icon className="text-4xl text-black dark:text-white" />
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-navy-700 dark:text-white text-center mb-2">
                {ally.name}
              </h3>

              {/* Type Label */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {ally.type === 'website' ? 'Sitio Web' : 'Información'}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
