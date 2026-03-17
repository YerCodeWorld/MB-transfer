"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useIsClient } from "@/hooks/useIsClient";

import Light from "../../../public/layout/Light.png";
import Dark from "../../../public/layout/Dark.png";
import DefaultSidebar from "../../../public/layout/DefaultSidebar.png";
import DefaultSidebarDark from "../../../public/layout/DefaultSidebarDark.png";
import MiniSidebar from "../../../public/layout/MiniSidebar.png";
import MiniSidebarDark from "../../../public/layout/MiniSidebarDark.png";

// Assets
import {
  MdSettings,
  MdFullscreen,
  MdOutlineFullscreenExit,
  MdClose,
  MdCheckCircle,
  MdLogout,
} from "react-icons/md";
import ConfiguratorRadio from "./ConfiguratorRadio";

export default function HeaderLinks(props: { [x: string]: any }) {
  const { setMini, setTheme, themePresets, darkmode, setDarkmode, selectedBackground, setSelectedBackground } = props;
  const { logout, employee } = useAuth();
  const router = useRouter();
  const isClient = useIsClient();

  const [open, setOpen] = useState(false);
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const active = activeOverride ?? employee?.appAccent ?? "purple";

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Available backgrounds
  const backgrounds = [
    { name: 'Globos', filename: 'bg-globes.jpg', preview: '/bg-globes.jpg' },
    { name: 'Bosque', filename: 'bg-forest.jpg', preview: '/bg-forest.jpg' },
    { name: 'Hojas', filename: 'bg-leaves.jpg', preview: '/bg-leaves.jpg' },
    { name: 'Montañas', filename: 'bg-mountains.jpg', preview: '/bg-mountains.jpg' },
    { name: 'Agua', filename: 'bg-water.jpg', preview: '/bg-water.jpg' },
  ];

  // Helper function to change theme with backend save
  const changeTheme = (themeName: string) => {
    if (themePresets && themePresets[themeName]) {
      setTheme(themePresets[themeName], themeName);
      setActiveOverride(themeName);
    }
  };

  useEffect(() => {
    if (showBackgroundModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBackgroundModal]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button        
        onClick={() => setOpen(true)}
      >
        <MdSettings className="h-[18px] w-[18px] text-gray-400 dark:text-white" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-[120]">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Cerrar configuración"
          />
          <div className="absolute right-0 top-0 h-screen w-[92vw] max-w-[460px] bg-white shadow-[-20px_17px_40px_4px_rgba(112,_144,_176,_0.18)] dark:bg-navy-800">
            
            {/* Header */}
            <div className="w-full p-4">
              <div className="flex items-center justify-between bg-white dark:bg-navy-800">
                <div className="flex items-center p-4">

                  <div>
                    <p className="text-xl font-bold text-accent-600 dark:text-accent-200/80">
                      Configuración
                    </p>
                    <p className="text-md flex font-medium text-gray-600 dark:text-accent-50/80">
                      Plataforma MBT
                      <span className="ml-1.5 flex items-center rounded-3xl bg-brand-50 px-2 text-sm font-semibold text-brand-500 dark:bg-white/10 dark:text-white">
                        v0.2.0
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <MdClose className="h-4 w-4 text-gray-900 dark:text-white" />
                </button>
              </div>
              <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-dark-700" />
            </div>

            {/* Body */}
            <div className="max-h-[calc(100vh-160px)] w-full overflow-y-auto px-5 pb-6 pt-0 sm:px-7">
              <div className="flex flex-col">
                <p className="mb-3 font-bold text-gray-900 dark:text-white">
                  Tema
                </p>
                <div className="mb-7 flex w-full justify-between gap-5">
                  <ConfiguratorRadio
                    onClick={() => {
                      if (darkmode) {
                        document.documentElement.classList.remove("dark");
                        setDarkmode(false);
                      }
                    }}
                    active={!darkmode}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Claro
                      </p>
                    }
                  >
                    <Image
                      className="max-w-[130px] rounded-lg"
                      alt=""
                      src={Light}
                    />
                  </ConfiguratorRadio>

                  <ConfiguratorRadio
                    onClick={() => {
                      if (!darkmode) {
                        document.documentElement.classList.add("dark");
                        setDarkmode(true);
                      }
                    }}
                    active={darkmode}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Oscuro
                      </p>
                    }
                  >
                    <Image className="max-w-[130px] rounded-lg" alt="" src={Dark} />
                  </ConfiguratorRadio>
                </div>

                <p className="mb-3 font-bold text-gray-900 dark:text-white">
                  Sidebar
                </p>
                <div className="mb-7 flex w-full justify-between gap-5">
                  <ConfiguratorRadio
                    onClick={() => setMini(false)}
                    active={props.mini === true ? false : true}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Defácto
                      </p>
                    }
                  >
                    <div className={`flex min-h-[126px] w-[130px] items-center justify-center overflow-hidden rounded-[10px] border-[1px] border-gray-200 bg-gray-100 bg-repeat pt-2.5 pl-2.5 dark:border-[#323B5D] dark:bg-navy-900`}>
                      <Image
                        className="max-w-full shadow-[0px_6px_14px_rgba(200,_207,_215,_0.6)] dark:shadow-none md:max-w-[96px]"
                        alt=""
                        src={darkmode ? DefaultSidebarDark : DefaultSidebar}
                      />
                    </div>
                  </ConfiguratorRadio>
                  
                  <ConfiguratorRadio
                    onClick={() => setMini(true)}
                    active={props.mini === false ? false : true}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Minimizado
                      </p>
                    }
                  >
                    <div className={`flex min-h-[126px] w-[130px] items-center justify-center overflow-hidden rounded-[10px] border-[1px] border-gray-200 bg-gray-100 bg-repeat pt-2.5 pl-2.5 dark:border-[#323B5D] dark:bg-navy-900`}>
                      <Image
                        className="max-w-full shadow-[0px_6px_14px_rgba(200,_207,_215,_0.6)] dark:shadow-none md:max-w-[75px]"
                        alt=""
                        src={darkmode ? MiniSidebarDark : MiniSidebar}
                      />
                    </div>
                  </ConfiguratorRadio>
                </div>

                {/* Accent Switching */}
                <p className="mb-3 font-bold text-gray-900 dark:text-white">
                  Acento
                </p>
                <div className="flex w-full flex-wrap justify-between gap-5">
                  <button
                    onClick={() => changeTheme('purple')}
                    className={`flex h-max w-[95px] items-center justify-center rounded-2xl border-[1px] lg:w-[96px] ${
                      active === "purple"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-purple-500 shadow-[0px_6px_18px_rgba(67,_24,_255,_0.5)] dark:bg-horizonPurple-400 dark:shadow-[0px_6px_18px_(117,_81,_255,_0.5)]" />
                  </button>

                  <button
                    onClick={() => changeTheme('green')}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "green"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-green-500 shadow-[0px_6px_18px_rgba(1,_181,_116,_0.5)] dark:bg-horizonGreen-400 dark:shadow-[0px_6px_18px_rgba(53,_210,_138,_0.5)]" />
                  </button>

                  <button
                    onClick={() => changeTheme('orange')}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "orange"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-orange-500 shadow-[0px_6px_18px_rgba(255,_181,_71,_0.5)] dark:bg-horizonOrange-400 dark:shadow-[0px_6px_18px_rgba(255,_181,_71,_0.5)]" />
                  </button>

                  <button
                    onClick={() => changeTheme('red')}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "red"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-red-500 shadow-[0px_6px_18px_rgba(227,_26,_26,_0.5)] dark:bg-horizonRed-400 dark:shadow-[0px_6px_18px_rgba(227,_26,_26,_0.5)]" />
                  </button>

                  <button
                    onClick={() => changeTheme('blue')}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "blue"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-blue-500 shadow-[0px_6px_18px_rgba(57,_101,_255,_0.5)] dark:bg-horizonBlue-400 dark:shadow-[0px_6px_18px_rgba(57,_101,_255,_0.5)]" />
                  </button>

                  <button
                    onClick={() => changeTheme('teal')}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "teal"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-teal-500 shadow-[0px_6px_18px_rgba(51,_195,_183,_0.5)] dark:bg-horizonTeal-400 dark:shadow-[0px_6px_18px_rgba(51,_195,_183,_0.5)]" />
                  </button>
                </div>
                
                {/* Background Selector Section */}
                <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-navy-700" />
                
                <p className="mb-3 font-bold text-gray-900 dark:text-white">
                  Fondo de Pantalla
                </p>
                <button
                  onClick={() => setShowBackgroundModal(true)}
                  className="text-md flex h-max w-full bg-center bg-no-repeat bg-cover items-center justify-center rounded-2xl border-[1px] border-gray-200 bg-[rgba(11,11,11,0)] py-2 font-bold text-gray-900 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 dark:text-white hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none"
                  style={{
                    backgroundImage: `url('/${selectedBackground}')`
                  }}
                >  
                  <div className="bg-white/80 dark:bg-navy-900/50 ounded p-1">
                  Fondo Actual:
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {backgrounds.find(bg => bg.filename === selectedBackground)?.name || 'Globos'}
                  </span>
                  </div>
                </button>
              </div>
              
              <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-navy-700" />

              {/* Full Screen Mode */}
              <p className="mb-3 font-bold text-gray-900 dark:text-white">
                Tamaño
              </p>
              <button
                className="text-md flex h-max w-full items-center justify-center rounded-2xl border-[1px] border-gray-200 bg-[rgba(11,11,11,0)] py-4 font-bold text-gray-900 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 dark:text-white hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none"
                onClick={() => {
                  if (isFullscreen) {
                    document.exitFullscreen();
                  } else {
                    document.body.requestFullscreen();
                  }
                }}
              >
                {isFullscreen ? "Salir Pantalla Completa" : "Pantalla Completa"}
                {isFullscreen ? (
                  <MdOutlineFullscreenExit className="ml-1.5 h-[18px] w-[18px] text-gray-900 dark:text-white" />
                ) : (
                  <MdFullscreen className="ml-1.5 h-[18px] w-[18px] text-gray-900 dark:text-white" />
                )}
              </button>

              <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-navy-700" />

              {/* Logout Button */}
              <p className="mb-3 font-bold text-gray-900 dark:text-white">
                Sesión
              </p>
              <button
                className="text-md flex h-max w-full items-center justify-center rounded-2xl border-[1px] border-red-300 bg-[rgba(11,11,11,0)] py-4 font-bold text-red-600 hover:bg-red-50 hover:shadow-[0px_18px_40px_rgba(220,_38,_38,_0.22)] focus:bg-red-50 focus:shadow-[0px_18px_40px_rgba(220,_38,_38,_0.22)] active:bg-red-100 active:shadow-[0px_18px_40px_rgba(220,_38,_38,_0.22)] dark:border-red-800 dark:text-red-400 hover:dark:bg-red-900/20 hover:dark:shadow-none focus:dark:bg-red-900/20 focus:dark:shadow-none active:dark:bg-red-900/30 active:dark:shadow-none"
                onClick={handleLogout}
              >
                Cerrar Sesión
                <MdLogout className="ml-1.5 h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Selection Modal */}
      {showBackgroundModal && isClient && createPortal(
        <div 
          className="fixed inset-0 z-[50000] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBackgroundModal(false);
            }
          }}
        >
          <div className="w-full max-w-3xl max-h-[85vh] rounded-xl bg-white dark:bg-navy-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-navy-800">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Seleccionar Fondo de Pantalla
              </h3>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content with inner scroll */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {backgrounds.map((background) => (
                  <div
                    key={background.filename}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02] ${
                      selectedBackground === background.filename
                        ? 'border-accent-500 shadow-lg ring-2 ring-accent-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-accent-300'
                    }`}
                    onClick={() => {
                      setSelectedBackground?.(background.filename);
                      setShowBackgroundModal(false);
                    }}
                  >
                    <div className="aspect-video w-full relative">
                      <Image
                        src={background.preview}
                        alt={background.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    
                    {selectedBackground === background.filename && (
                      <div className="absolute top-2 right-2 bg-accent-500 text-white rounded-full p-1.5 shadow-lg">
                        <MdCheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                      <p className="text-white font-medium text-sm text-center">{background.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional padding for scroll */}
              <div className="h-4"></div>
            </div>
          </div>
        </div>,
        document.body
      )}
 
   </>
  );
}
