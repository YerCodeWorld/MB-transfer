"use client"

import { useState, useEffect } from "react";
import NavBar from "../../../components/single/navbar";
import Sidebar from "../../../components/single/sidebar";
import BottomBar from "../../../components/single/bottombar";
import ItinerarySection from "../../../components/compound/dateservices";

export default function Home() {    

  const sections: Record<string, React.ReactNode> = {
    'itinerary': ItinerarySection,
    'notes': BottomBar    
  }    
  
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("Main Dashboard");
  const [section, setSection] = useState("itinerary");
  const [mini, setMini] = useState(false);

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


    <div>
        
      <Sidebar
        open={open}
        hovered={hovered}
        setHovered={setHovered}
        mini={mini}
        onClose={() => setOpen(false)}
        activeKey={section as any}
        onSelect={(k) => setSection(k)}
      />

      <BottomBar section={section} mini={mini && !hovered}/>

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
          <div className="h-full w-full bg-white/50 dark:bg-dark-700/50">
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
          
            
            <div className="mx-auto min-h-screen p-2 !pt-[100px] md:p-2">
              {/* MainView */}           
              
              {section === 'itinerary' ? <ItinerarySection /> : <BottomBar />}
            </div>
              
          </div>
          </div>                  
        </main>        
      </div>        
    </div>

  )
}



