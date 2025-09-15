import Image from "next/image";
import authImg from "../public/airplane.jpg";
import { MdWarning, MdWarningAmber } from "react-icons/md";
import FixedSwitch from "../components/single/fixedSwitch";

// access key logic, including fetching and validation 

export default function Auth() {
  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-navy-900">

      {/* This is how you switch themes here */}
      <FixedSwitch/>
    
      {/* Left side */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 sm:px-10 lg:px-16">
      
        <div style={{                 
          boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px"                    
        }}
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2x1 p-8 sm:p-10 bg-white/80 dark:bg-navy-700/80 shadow-x1 shadow-black/20 backdrop-blur animate-pulse dark:bg-navy-700 "
        >

          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Plataforma MBT
          </h1>
          
          <p className="mb-8 text-neutral-600 dark:text-neutral-200">
            Introduzca la llave de acceso para continuar a la plataforma. 
            Por favor asegurese de entrar la llave provista por su administrador.
          </p>          

          <form className="space-y-4">
            <input
              type="password"
              placeholder="Introducir llave de acceso..."
              className="w-full rounded-lg border border-neutral-300 bg-transparent px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:border-blue-500 focus:ring focus:ring-blue-300 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-100"
            />    
            
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus:ring focus:ring-blue-400"
            >
              Acceder
            </button>

            <hr className="border-navy-900 dark:border-white" />

            <div className="flex">
              <MdWarningAmber className="size-15 text-amber-500 mr-5" aria-label="warning"/>
              <p className="text-red-600 text-sm">
                Si usted posee una clave de acceso pero su dispositivo no está estrictamente autorizado,
                será permanentemente baneado y cualquier intento de acceso será rechazado. 
              </p>
            </div>            
            
            <footer className="mt-16 text-sm text-neutral-500 dark:text-white">
                {new Date().getFullYear()} Plataforma MBT.
            </footer>        
                    
          </form>
        </div>        
      </div>

      {/* Right side image */}
      <div className="relative hidden w-0 flex-1 md:block">
        <Image
          src={authImg}
          alt="Airplane"
          fill
          className="object-cover object-center rounded-bl-[120px] xl:rounded-bl-[200px]"
          priority
        />
      </div>
    </div>
  );
}

