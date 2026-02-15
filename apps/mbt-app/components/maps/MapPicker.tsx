"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdClose, MdMyLocation } from "react-icons/md";

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPicker({ latitude, longitude, onLocationSelect, onClose }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const initialCenter = selectedCoords || { lat: 18.7357, lng: -70.1627 }; // Dominican Republic

    const newMap = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: selectedCoords ? 14 : 8,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);

    // Add click listener
    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedCoords({ lat, lng });
      }
    });
  }, [isLoaded, mapRef, map, selectedCoords]);

  // Update marker when coords change
  useEffect(() => {
    if (!map || !selectedCoords) return;

    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new google.maps.Marker({
      position: selectedCoords,
      map: map,
      draggable: true,
    });

    newMarker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedCoords({ lat, lng });
      }
    });

    setMarker(newMarker);
    map.panTo(selectedCoords);
  }, [selectedCoords, map]);

  const handleConfirm = () => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng);
      onClose();
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          alert("Error obteniendo ubicación: " + err.message);
        }
      );
    } else {
      alert("Geolocalización no soportada por este navegador");
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-navy-800 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">Error</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <MdClose className="text-2xl" />
            </button>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            Seleccionar Ubicación
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full min-h-[400px]" />

          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            className="absolute top-4 right-4 bg-white dark:bg-navy-900 rounded-lg p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-navy-800"
            title="Usar mi ubicación actual"
          >
            <MdMyLocation className="text-xl text-brand-500" />
          </button>
        </div>

        {/* Coordinates Display & Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {selectedCoords && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Coordenadas:</span>{" "}
                {selectedCoords.lat.toFixed(8)}, {selectedCoords.lng.toFixed(8)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!selectedCoords}
              className="flex-1 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Ubicación
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-gray-200 dark:bg-gray-700 px-6 py-3 text-sm font-semibold text-navy-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
