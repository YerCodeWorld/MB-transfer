"use client"

import { useState, useEffect, useMemo } from "react";

// MY BEAUTIFUL BARS
import NavBar from "../../../components/single/navbar";
import Sidebar from "../../../components/single/sidebar";
import BottomBar from "../../../components/single/bottombar";

// MY BEAUTIFUL VIEWS
// will be collocating here as I place in views
import ItineraryView from "../../../views/itinerary";
import PersonnelView from "../../../views/personnel";
import StatisticsView from "../../../views/statistics";
import WorkdayView from "../../../views/workday";

// A guard to get trash out
import AuthGuard from "../../../components/guards/AuthGuard";

// MY BEAUTIFUL HOOKS
import { NavigationProvider, useNavigation } from "../../../contexts/NavigationContext";
import { BottomBarProvider } from "../../../contexts/BottomBarContext";
import { useAuth } from "../../../contexts/AuthContext";

// Please get rid of this asap
import { ServiceDataProvider } from "../../../contexts/ServiceDataContext";
import { apiClient } from "../../../utils/api";

type ThemeVars = Record<string, string>;

function PlatformContent() {

  const { navigation, setCurrentSection } = useNavigation();
  const { employee, refreshAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const section = navigation.currentSection;

  const renderMainView = () => {
    if (navigation.stack.length > 0) {
      const currentView = navigation.stack[navigation.stack.length - 1];
      
      if (currentView.component) {
        const Component = currentView.component;
        return <Component {...currentView.data} />;
      }
      
      return (
        <div className="rounded-[20px] bg-background-100 p-6 shadow-3xl shadow-shadow-100 dark:!bg-background-900 dark:shadow-none">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
            {currentView.label}
          </h2>
          <div className="text-gray-600 dark:text-gray-300">
            <p>Service Type: {currentView.data?.serviceType}</p>
            <p>This is a placeholder for the {currentView.label} service details.</p>
            <p>You can implement specific components for each service type.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {
          section === 'workday' ? <WorkdayView /> :
          section === 'itinerary' ? <ItineraryView /> :
          section === 'employees' ? <PersonnelView /> :
          section === 'stats' ? <StatisticsView /> :
          <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
              Section not implemented
            </h2>
          </div>
        }
      </>
    );
  };

  useEffect(() => {
    const syncSidebarWithViewport = () => {
      setOpen(window.innerWidth >= 1200);
    };

    syncSidebarWithViewport();
    window.addEventListener("resize", syncSidebarWithViewport);
    return () => window.removeEventListener("resize", syncSidebarWithViewport);
  }, []);

  const defaultTheme = useMemo(() => ({
    "--background-100": "#FFFFFF",
    "--background-900": "#070f2e",
    "--shadow-100": "rgba(112, 144, 176, 0.08)",
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
  }), []);

  // Theme presets mapping
  const themePresets: Record<string, ThemeVars> = useMemo(() => ({
    purple: {
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
    },
    green: {
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
    },
    orange: {
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
    },
    red: {
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
    },
    blue: {
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
    },
    teal: {
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
    },
  }), []);

  const [miniOverride, setMiniOverride] = useState<boolean | null>(null);
  const [selectedBackgroundOverride, setSelectedBackgroundOverride] = useState<string | null>(null);
  const [currentAccentOverride, setCurrentAccentOverride] = useState<string | null>(null);
  const [darkmodeOverride, setDarkmodeOverride] = useState<boolean | null>(null);
  const [themeOverride, setThemeOverride] = useState<Record<string, string> | null>(null);

  const mini = miniOverride ?? employee?.minimized ?? false;
  const selectedBackground = selectedBackgroundOverride ?? employee?.background ?? 'bg-globes.jpg';
  const currentAccent = currentAccentOverride ?? employee?.appAccent ?? 'purple';
  const darkmode = darkmodeOverride ?? employee?.darkMode ?? false;
  const themeApp = themeOverride ?? themePresets[currentAccent] ?? defaultTheme;

  // Save customization settings to backend when they change
  const saveCustomization = async (changes: {
    minimized?: boolean;
    background?: string;
    appAccent?: string;
    darkMode?: boolean;
  }) => {
    if (!employee) return;

    try {
      const payload = {
        minimized: changes.minimized ?? mini,
        background: changes.background ?? selectedBackground,
        appAccent: changes.appAccent ?? currentAccent,
        darkMode: changes.darkMode ?? darkmode,
      };

      await apiClient.put(`/api/v1/employees/${employee.id}`, {
        ...payload,
      });
      // Refresh auth to get updated employee data
      await refreshAuth();
    } catch (error) {
      console.error("Error saving customization:", error);
    }
  };

  // Wrapper for setMini that also saves to backend
  const handleSetMini = (value: boolean) => {
    setMiniOverride(value);
    saveCustomization({ minimized: value });
  };

  // Wrapper for setSelectedBackground that also saves to backend
  const handleSetSelectedBackground = (value: string) => {
    setSelectedBackgroundOverride(value);
    saveCustomization({ background: value });
  };

  // Wrapper for setTheme that also saves to backend
  const handleSetTheme = (theme: ThemeVars, themeName?: string) => {
    setThemeOverride(theme);
    if (themeName) {
      setCurrentAccentOverride(themeName);
      saveCustomization({ appAccent: themeName });
    }
  };

  // Wrapper for darkmode that also saves to backend
  const handleSetDarkmode = (value: boolean) => {
    setDarkmodeOverride(value);
    saveCustomization({ darkMode: value });
  };

  useEffect(() => {
    let color;
    for (color in themeApp) {
      document.documentElement.style.setProperty(color, themeApp[color]);
    }
  }, [themeApp]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkmode);
  }, [darkmode]);
  
  return (
    <AuthGuard>
      <div>

      {/* Side bar that can minimize when unhovered */}
      <Sidebar
        open={open}
        hovered={hovered}
        setHovered={setHovered}
        mini={mini}
        onClose={() => setOpen(false)}
        activeKey={section as any}
        onSelect={(k) => setCurrentSection(k)}
      />

      {/* ... */}
      <div 
        className="h-screen w-full font-dm bg-center bg-no-repeat bg-cover md:pr-2 flex flex-col transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `url('/${selectedBackground}')`
        }}
      >
        <main
          className={`flex-1 overflow-hidden transition-all ${
              mini === false
                ? "xl:ml-[313px]"
                : mini === true && hovered === true
                ? "xl:ml-[313px]"
                : "ml-0 xl:ml-[142px]"
            } `}
        >
          <div className="h-full w-full bg-white/90 dark:bg-dark-700/90 flex flex-col">
            <NavBar
              onOpenSidenav={() => setOpen((prev) => !prev)}
              brandText={"Example"}
              secondary={"Example2"}
              theme={themeApp}
              setTheme={handleSetTheme}
              themePresets={themePresets}
              darkmode={darkmode}
              setDarkmode={handleSetDarkmode}
              hovered={hovered}
              mini={mini}
              setMini={handleSetMini}
              selectedBackground={selectedBackground}
              setSelectedBackground={handleSetSelectedBackground}
            />                      
            <div className="flex-1 overflow-y-auto p-2 !pt-[100px] md:p-2 z-0">
              
              {/* MainView */}
              {renderMainView()}
            </div>
          </div>                  
        </main>
        
        <div className={`transition-all ${
            mini === false
              ? "xl:ml-[313px]"
              : mini === true && hovered === true
              ? "xl:ml-[313px]"
              : "ml-0 xl:ml-[142px]"
          } `}
        >
          <BottomBar section={section} mini={mini && !hovered} className="bg-white/95 dark:border-gray-700 dark:bg-navy-800/95 z-0" />
        </div>        
      </div>        
      </div>
    </AuthGuard>
  );
}

export default function Home() {
	return (
		<NavigationProvider>
			<ServiceDataProvider>
				<BottomBarProvider>
					<PlatformContent />
				</BottomBarProvider>
			</ServiceDataProvider>
		</NavigationProvider>
	);
}
