"use client"

import { useState, useEffect } from "react";

import NavBar from "../../../components/single/navbar";
import Sidebar from "../../../components/single/sidebar";
import BottomBar from "../../../components/single/bottombar";

import ItinerarySection from "../../../components/compound/dateservices";
import UsersOverview from "../../../components/compound/users";
import CalendarManager from "../../../components/compound/calendar";
import Accounting from "../../../components/compound/accounting";

import AuthGuard from "../../../components/guards/AuthGuard";
import { NavigationProvider, useNavigation } from "../../../contexts/NavigationContext";
import { ServiceProvider } from "../../../contexts/ServiceContext";

import Breadcrumb from "../../../components/single/breadcrumb";

function PlatformContent() {
  const { navigation, setCurrentSection } = useNavigation();
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mini, setMini] = useState(false);

  const section = navigation.currentSection;

  const renderMainView = () => {
    if (navigation.stack.length > 0) {
      const currentView = navigation.stack[navigation.stack.length - 1];
      
      if (currentView.component) {
        const Component = currentView.component;
        return <Component data={currentView.data} />;
      }
      
      return (
        <div className="rounded-[20px] bg-white p-6 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
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
          section === 'itinerary' ? <ItinerarySection /> :
          section === 'employees' ? <UsersOverview /> : 
          section === 'notes' ? <CalendarManager /> :
          section === 'stats' ? <Accounting /> :
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
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );    
  }, []);

  const [themeApp, setThemeApp] = useState<any>({
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
  });

  useEffect(() => {
    let color;
    for (color in themeApp) {
      document.documentElement.style.setProperty(color, themeApp[color]);
    }
  })
  
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

      {/* Bottom bar for contextual actions */}
      <BottomBar section={section} mini={mini && !hovered} />

      {/* ... */}
      <div className="h-full w-full font-dm bg-[url('/bg-globes.jpg')] bg-center bg-no-repeat bg-cover md:pr-2">
        <main
          className={` flex-none transition-all ${
              mini === false
                ? "xl:ml-[313px]"
                : mini === true && hovered === true
                ? "xl:ml-[313px]"
                : "ml-0 xl:ml-[142px]"
            } `}
        >
          <div className="h-full w-full bg-white/90 dark:bg-dark-700/90">
          <div>
            
            <NavBar
              onOpenSidenav={() => setOpen(!open)}
              brandText={"Example"}
              secondary={"Example2"}
              theme={themeApp}
              setTheme={setThemeApp}
              hovered={hovered}        
              mini={mini}
              setMini={setMini}
            />
                      
            <div className="mx-auto min-h-screen p-2 !pt-[100px] md:p-2 z-0">
            
              {/* Breadcrumb */}
              <Breadcrumb className="mb-4" />
              
              {/* MainView */}
              {renderMainView()}
            </div>
              
          </div>
          </div>                  
        </main>        
      </div>        
      </div>
    </AuthGuard>
  );
}

export default function Home() {
  return (
    <NavigationProvider>
      <ServiceProvider>
        <PlatformContent />
      </ServiceProvider>
    </NavigationProvider>
  );
}



