"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';

import ContrastBlockDark from "../../../public/layout/ContrastBlockDark.png";
import Light from "../../../public/layout/Light.png";
import Dark from "../../../public/layout/Dark.png";
import ContrastBlock from "../../../public/layout/ContrastBlock.png";
import DefaultSidebar from "../../../public/layout/DefaultSidebar.png";
import DefaultSidebarDark from "../../../public/layout/DefaultSidebarDark.png";
import MiniSidebar from "../../../public/layout/MiniSidebar.png";
import MiniSidebarDark from "../../../public/layout/MiniSidebarDark.png";
import ConfiguratorLogo from "../../../public/layout/ConfiguratorLogo.png";

// Assets
import {
  MdSettings,
  MdFullscreen,
  MdOutlineFullscreenExit,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";
import ConfiguratorRadio from "./ConfiguratorRadio";

export default function HeaderLinks(props: { [x: string]: any }) {
  const { mini, setMini, theme, setTheme, darkmode, setDarkmode, selectedBackground, setSelectedBackground } = props;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Purple");
  const [contrast, setContrast] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Available backgrounds
  const backgrounds = [
    { name: 'Globos', filename: 'bg-globes.jpg', preview: '/bg-globes.jpg' },
    { name: 'Bosque', filename: 'bg-forest.jpg', preview: '/bg-forest.jpg' },
    { name: 'Hojas', filename: 'bg-leaves.jpg', preview: '/bg-leaves.jpg' },
    { name: 'Montañas', filename: 'bg-mountains.jpg', preview: '/bg-mountains.jpg' },
    { name: 'Agua', filename: 'bg-water.jpg', preview: '/bg-water.jpg' },
  ];

  // Theme functions remain the same
  const resetTheme = () => {
  const newTheme = {
      "--shadow-100": "rgba(112, 144, 176, 0.08)",
      "--background-100": "#FFFFFF",
      "--background-900": "#0b1437",
      "--color-accent-50": "#EEEAFB",
      "--color-accent-100": "#D8D2F5",
      "--color-accent-200": "#B4ABEE",
      "--color-accent-300": "#9085E0",
      "--color-accent-400": "#7267D4",
      "--color-accent-500": "#5047C2",
      "--color-accent-600": "#3E36A5",
      "--color-accent-700": "#2E287F",
      "--color-accent-800": "#201C5A",
      "--color-accent-900": "#141238",
    };
    setTheme(newTheme);
  };

  const changeThemeGreen = () => {
    const newTheme = {
      "--color-accent-50": "#ECF6F1",
      "--color-accent-100": "#D7EDE0",
      "--color-accent-200": "#B0DAC1",
      "--color-accent-300": "#87C5A1",
      "--color-accent-400": "#63AF86",
      "--color-accent-500": "#438F6C",
      "--color-accent-600": "#337055",
      "--color-accent-700": "#245140",
      "--color-accent-800": "#17352B",
      "--color-accent-900": "#0C1F18",
    };
    setTheme(newTheme);
  };

  const changeThemeOrange = () => {
    const newTheme = {
      "--color-accent-50": "#FFF4EA",
      "--color-accent-100": "#FFE6CC",
      "--color-accent-200": "#FDD1A3",
      "--color-accent-300": "#F9B871",
      "--color-accent-400": "#F39E4A",
      "--color-accent-500": "#DB7F2F",
      "--color-accent-600": "#B56223",
      "--color-accent-700": "#8D4A1B",
      "--color-accent-800": "#5C3011",
      "--color-accent-900": "#341C09",
      "--color-accent-950": "#1C0F05",
    };
    setTheme(newTheme);
  };

  const changeThemeRed = () => {
    const newTheme = {
      "--color-accent-50": "#FDECEC",
      "--color-accent-100": "#FAD5D5",
      "--color-accent-200": "#F4ABAB",
      "--color-accent-300": "#EB8080",
      "--color-accent-400": "#DE5A5A",
      "--color-accent-500": "#C63D3D",
      "--color-accent-600": "#A13030",
      "--color-accent-700": "#782424",
      "--color-accent-800": "#501818",
      "--color-accent-900": "#301010",
      "--color-accent-950": "#1A0909",
    };
    setTheme(newTheme);
  };

  const changeThemeBlue = () => {
    const newTheme = {
      "--color-accent-50": "#ECF3FF",
      "--color-accent-100": "#D7E4FF",
      "--color-accent-200": "#B3CCFF",
      "--color-accent-300": "#8FAFEE",
      "--color-accent-400": "#6D92DF",
      "--color-accent-500": "#4B74C5",
      "--color-accent-600": "#355CA4",
      "--color-accent-700": "#28457C",
      "--color-accent-800": "#1B2E52",
      "--color-accent-900": "#101C33",
      "--color-accent-950": "#070E1A",
    };
    setTheme(newTheme);
  };

  const changeThemeTeal = () => {
    const newTheme = {
      "--color-accent-50": "#EAF6F6",
      "--color-accent-100": "#D4ECEB",
      "--color-accent-200": "#A9D9D7",
      "--color-accent-300": "#7CC4C1",
      "--color-accent-400": "#56AEAA",
      "--color-accent-500": "#3A8E8A",
      "--color-accent-600": "#2D706C",
      "--color-accent-700": "#215352",
      "--color-accent-800": "#153736",
      "--color-accent-900": "#0C2020",
      "--color-accent-950": "#061010",
    };
    setTheme(newTheme);
  };

  const changeThemeBrand = () => {
    const newTheme = {
      "--color-accent-50": "#F1ECFF",
      "--color-accent-100": "#E2D9FF",
      "--color-accent-200": "#C3B5FF",
      "--color-accent-300": "#A391FF",
      "--color-accent-400": "#8470F5",
      "--color-accent-500": "#6554E0",
      "--color-accent-600": "#4E40BF",
      "--color-accent-700": "#3A3194",
      "--color-accent-800": "#282263",
      "--color-accent-900": "#181536",
    };
    setTheme(newTheme);
  };

  const changeBgDefault = () => {
    let newTheme = theme;
    newTheme = {
      "--shadow-100": "rgba(112, 144, 176, 0.08)",
      "--background-100": "#FFFFFF",
      "--background-900": "#0b1437",
    };
    setTheme(newTheme);
  };

  const changeBgContrast = () => {
    let newTheme = theme;
    newTheme = {
      "--shadow-100": "transparent",
      "--background-100": "#F4F7FE",
      "--background-900": "#070f2e",
    };
    setTheme(newTheme);
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  useEffect(() => {
    if (theme["--background-100"] === "#FFFFFF") {
      setContrast(false);
    } else {
      setContrast(true);
    }
  }, [theme]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <>
      <button        
        onClick={() => setOpen(true)}
      >
        <MdSettings className="h-[18px] w-[18px] text-gray-400 dark:text-white" />
      </button>
      
      {/* DaisyUI Drawer */}
      <div className={`drawer-end z-2`}>
        <input 
          id="config-drawer" 
          type="checkbox" 
          className="drawer-toggle" 
          checked={open}
          onChange={(e) => setOpen(e.target.checked)}
        />
        
        {/* Backdrop */}
        <div className="drawer-side">
                    
          {/* Drawer Content */}
          <div className="max-w-[25vw] rounded-[40px] bg-white dark:bg-navy-800 shadow-[-20px_17px_40px_4px_rgba(112,_144,_176,_0.18)]">
            
            {/* Header */}
            <div className="p-4 w-full">
              <div className="flex items-center justify-between bg-white dark:bg-navy-800">
                <div className="flex items-center p-4">

                  <div>
                    <p className="text-xl font-bold text-accent-600 dark:text-accent-200/80">
                      Configuración
                    </p>
                    <p className="text-md flex font-medium text-gray-600 dark:text-accent-50/80">
                      Plataforma MBT
                      <span className="ml-1.5 flex items-center rounded-3xl bg-brand-50 px-2 text-sm font-semibold text-brand-500 dark:bg-white/10 dark:text-white">
                        v3.1.0
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-sm btn-ghost"
                >
                  <MdClose className="h-4 w-4 text-gray-900 dark:text-white" />
                </button>
              </div>
              <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-dark-700" />
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-7 pt-0 pb-6 w-full max-h-[calc(100vh-200px)]">
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
                  Contraste
                </p>
                <div className="mb-7 flex w-full justify-between gap-5">
                  <ConfiguratorRadio
                    onClick={() => changeBgDefault()}
                    active={contrast === true ? false : true}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Transparent
                      </p>
                    }
                  >
                    <div className={`flex max-w-[144px] overflow-hidden rounded-[10px] border-[1px] border-gray-100 `}>
                      <Image
                        className="mt-auto shadow-[0px_6px_14px_rgba(200,_207,_215,_0.6)] dark:shadow-none"
                        src={darkmode ? ContrastBlockDark : ContrastBlock}
                        alt=""
                      />
                    </div>
                  </ConfiguratorRadio>
                  
                  <ConfiguratorRadio
                    onClick={() => changeBgContrast()}
                    active={contrast === false ? false : true}
                    label={
                      <p className="font-bold text-gray-900 dark:text-white">
                        Relleno
                      </p>
                    }
                  >
                    <div className={`flex max-w-[144px] overflow-hidden rounded-[10px] border-[1px] border-gray-200 bg-dark-100 bg-repeat pt-2.5 pl-2.5 dark:border-[#323B5D] dark:bg-dark-900`}>
                      <Image
                        className="mt-auto shadow-[0px_6px_14px_rgba(200,_207,_215,_0.6)] dark:shadow-none"
                        alt=""
                        src={darkmode ? ContrastBlockDark : ContrastBlock}
                      />
                    </div>
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
                    onClick={() => changeThemeBrand()}
                    className={`flex h-max w-[95px] items-center justify-center rounded-2xl border-[1px] lg:w-[96px] ${
                      active === "Purple"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-purple-500 shadow-[0px_6px_18px_rgba(67,_24,_255,_0.5)] dark:bg-horizonPurple-400 dark:shadow-[0px_6px_18px_(117,_81,_255,_0.5)]" />
                  </button>
                  
                  <button
                    onClick={() => changeThemeGreen()}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "Green"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-green-500 shadow-[0px_6px_18px_rgba(1,_181,_116,_0.5)] dark:bg-horizonGreen-400 dark:shadow-[0px_6px_18px_rgba(53,_210,_138,_0.5)]" />
                  </button>
                  
                  <button
                    onClick={() => changeThemeOrange()}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "Orange"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-orange-500 shadow-[0px_6px_18px_rgba(255,_181,_71,_0.5)] dark:bg-horizonOrange-400 dark:shadow-[0px_6px_18px_rgba(255,_181,_71,_0.5)]" />
                  </button>
                  
                  <button
                    onClick={() => changeThemeRed()}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "Red"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-red-500 shadow-[0px_6px_18px_rgba(227,_26,_26,_0.5)] dark:bg-horizonRed-400 dark:shadow-[0px_6px_18px_rgba(227,_26,_26,_0.5)]" />
                  </button>
                  
                  <button
                    onClick={() => changeThemeBlue()}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "Blue"
                        ? "bg-white dark:bg-dark-700"
                        : "bg-transparent"
                    } rounded-2xl border-gray-200 bg-[rgba(11,11,11,0)] py-4 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none`}
                  >
                    <div className="flex h-5 w-5 rounded-full bg-blue-500 shadow-[0px_6px_18px_rgba(57,_101,_255,_0.5)] dark:bg-horizonBlue-400 dark:shadow-[0px_6px_18px_rgba(57,_101,_255,_0.5)]" />
                  </button>
                  
                  <button
                    onClick={() => changeThemeTeal()}
                    className={`flex h-max w-[95px] items-center justify-center border-[1px] lg:w-[96px] ${
                      active === "Teal"
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
            </div>
          </div>
        </div>
      </div>

      {/* Background Selection Modal */}
      {showBackgroundModal && mounted && createPortal(
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
