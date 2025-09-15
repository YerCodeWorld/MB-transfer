"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import ContrastBlockDark from "../../../public/layout/ContrastBlockDark.png";
import Light from "../../../public/layout/Light.png";
import Dark from "../../../public/layout/Dark.png";
import ContrastBlock from "../../../public/layout/ContrastBlock.png";
import DefaultSidebar from "../../../public/layout/DefaultSidebar.png";
import DefaultSidebarDark from "../../../public/layout/DefaultSidebarDark.png";
import MiniSidebar from "../../../public/layout/MiniSidebar.png";
import MiniSidebarDark from "../../../public/layout/MiniSidebarDark.png";
import ConfiguratorLogo from "../../../public/layout/ConfiguratorLogo.png";

import Dialog from "../dialog";

// Assets
import {
  MdSettings,
  MdFullscreen,
  MdOutlineFullscreenExit,
  MdClose,
} from "react-icons/md";
import ConfiguratorRadio from "./ConfiguratorRadio";

export default function HeaderLinks(props: { [x: string]: any }) {
  const { mini, setMini, theme, setTheme, darkmode, setDarkmode } = props;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Purple");
  const [contrast, setContrast] = useState(false);
  const btnRef = React.useRef();

  const [isDialogOpen, setDialogOpen] = useState(false);

  // Theme functions remain the same
  const resetTheme = () => {
    const newTheme = {
      "--shadow-100": "rgba(112, 144, 176, 0.08)",
      "--background-100": "#FFFFFF",
      "--background-900": "#0b1437",
      "--color-accent-50": "#E9E3FF",
      "--color-accent-100": "#C0B8FE",
      "--color-accent-200": "#A195FD",
      "--color-accent-300": "#8171FC",
      "--color-accent-400": "#7551FF",
      "--color-accent-500": "#422AFB",
      "--color-accent-600": "#3311DB",
      "--color-accent-700": "#2111A5",
      "--color-accent-800": "#190793",
      "--color-accent-900": "#11047A",
    };
    setTheme(newTheme);
  };

  const changeThemeGreen = () => {
    const newTheme = {
      "--color-accent-50": "#E1FFF4",
      "--color-accent-100": "#BDFFE7",
      "--color-accent-200": "#7BFECE",
      "--color-accent-300": "#39FEB6",
      "--color-accent-400": "#01F99E",
      "--color-accent-500": "#01B574",
      "--color-accent-600": "#01935D",
      "--color-accent-700": "#016B44",
      "--color-accent-800": "#00472D",
      "--color-accent-900": "#002417",
    };
    setTheme(newTheme);
  };

  const changeThemeOrange = () => {
    const newTheme = {
      "--color-accent-50": "#FFF7EB",
      "--color-accent-100": "#FFF1DB",
      "--color-accent-200": "#FFE2B8",
      "--color-accent-300": "#FFD28F",
      "--color-accent-400": "#FFC46B",
      "--color-accent-500": "#FFB547",
      "--color-accent-600": "#FF9B05",
      "--color-accent-700": "#C27400",
      "--color-accent-800": "#855000",
      "--color-accent-900": "#422800",
      "--color-accent-950": "#1F1200",
    };
    setTheme(newTheme);
  };

  const changeThemeRed = () => {
    const newTheme = {
      "--color-accent-50": "#FCE8E8",
      "--color-accent-100": "#FAD1D1",
      "--color-accent-200": "#F4A4A4",
      "--color-accent-300": "#EF7676",
      "--color-accent-400": "#EA4848",
      "--color-accent-500": "#E31A1A",
      "--color-accent-600": "#B71515",
      "--color-accent-700": "#891010",
      "--color-accent-800": "#5B0B0B",
      "--color-accent-900": "#2E0505",
      "--color-accent-950": "#170303",
    };
    setTheme(newTheme);
  };

  const changeThemeBlue = () => {
    const newTheme = {
      "--color-accent-50": "#EBEFFF",
      "--color-accent-100": "#D6DFFF",
      "--color-accent-200": "#ADBFFF",
      "--color-accent-300": "#8AA3FF",
      "--color-accent-400": "#6183FF",
      "--color-accent-500": "#3965FF",
      "--color-accent-600": "#0036FA",
      "--color-accent-700": "#0029BD",
      "--color-accent-800": "#001B7A",
      "--color-accent-900": "#000D3D",
      "--color-accent-950": "#00071F",
    };
    setTheme(newTheme);
  };

  const changeThemeTeal = () => {
    const newTheme = {
      "--color-accent-50": "#EBFAF8",
      "--color-accent-100": "#D7F4F2",
      "--color-accent-200": "#AAE9E4",
      "--color-accent-300": "#82DED6",
      "--color-accent-400": "#59D4C9",
      "--color-accent-500": "#33C3B7",
      "--color-accent-600": "#299E94",
      "--color-accent-700": "#1F756E",
      "--color-accent-800": "#144D48",
      "--color-accent-900": "#0B2826",
      "--color-accent-950": "#051413",
    };
    setTheme(newTheme);
  };

  const changeThemeBrand = () => {
    const newTheme = {
      "--color-accent-50": "#EFEBFF",
      "--color-accent-100": "#E9E3FF",
      "--color-accent-200": "#422AFB",
      "--color-accent-300": "#422AFB",
      "--color-accent-400": "#7551FF",
      "--color-accent-500": "#422AFB",
      "--color-accent-600": "#3311DB",
      "--color-accent-700": "#02044A",
      "--color-accent-800": "#190793",
      "--color-accent-900": "#11047A",
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
          <div className="max-w-[90vw] rounded-[40px] bg-white dark:bg-navy-800 shadow-[-20px_17px_40px_4px_rgba(112,_144,_176,_0.18)]">
            
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
                        v1.0.0
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
              </div>
              
              <div className="my-[30px] h-px w-full bg-gray-200 dark:!bg-navy-700" />

              {/* Full Screen Mode */}
              <button
                className="text-md flex h-max w-full items-center justify-center rounded-2xl border-[1px] border-gray-200 bg-[rgba(11,11,11,0)] py-4 font-bold text-gray-900 hover:bg-white hover:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] focus:bg-white focus:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] active:bg-[#F7F9FF] active:shadow-[0px_18px_40px_rgba(112,_144,_176,_0.22)] dark:border-white/20 dark:text-white hover:dark:bg-navy-700 hover:dark:shadow-none focus:dark:bg-navy-700 focus:dark:shadow-none active:dark:bg-white/10 active:dark:shadow-none"
                onClick={() => {
                  isFullscreen
                    ? document.exitFullscreen()
                    : document.body.requestFullscreen();
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
 
   </>
  );
}
