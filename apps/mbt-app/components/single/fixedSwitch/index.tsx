"use client";

import { useState, useEffect } from "react";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

type FixedSwitchProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function FixedSwitch(props: FixedSwitchProps) {

  const [darkmode, setDarkmode] = useState<boolean>(false);

  useEffect(() => {    
    setDarkmode(document.documentElement.classList.contains("dark"));    
  }, []);

  const toggleTheme = () => {
  
    const html = document.documentElement;    
    console.log(html);
    
    if (darkmode) {
      html.classList.remove("dark");
      setDarkmode(false);
    } else {
      html.classList.add("dark");
      setDarkmode(true);
    }
  };

  return (
    <button
      className="border-px fixed bottom-[30px] right-[35px] z-[99] flex h-[60px] w-[60px] items-center justify-center rounded-full border-[#6a53ff] bg-gradient-to-br from-brand-300 to-yellow-700"
      onClick={toggleTheme}
      {...props}
    >
      <div className="cursor-pointer">
        {darkmode ? (
          <RiMoonFill className="h-5 w-5 text-white" />
        ) : (
          <RiSunFill className="h-5 w-5 text-white" />
        )}
      </div>
    </button>
  );
}

