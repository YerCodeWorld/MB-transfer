import Image from "next/image";
import authImg from "../public/airplane.jpg";

import FixedSwitch from "../components/single/fixedSwitch";

export default function Auth() {
  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-black">

      {/* This is how you switch themes here */}
      <FixedSwitch/>
    
      {/* Left side */}
      <div className="flex flex-1 flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md">
        
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Welcome Back
          </h1>
          <p className="mb-8 text-neutral-600 dark:text-white-400">
            Enter your access key to continue to the platform. Please make sure
            you’re using the key provided by your administrator.
          </p>

          <form className="space-y-4">
            <input
              type="password"
              placeholder="Enter access key"
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:border-blue-500 focus:ring focus:ring-blue-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />    
            
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus:ring focus:ring-blue-400"
            >
              Access
            </button>
          </form>
        </div>        

        {/* Footer placeholder */}
        <footer className="mt-16 text-sm text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </footer>        
                
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

