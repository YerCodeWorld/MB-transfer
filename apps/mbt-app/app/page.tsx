"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import authImg from "../public/world.jpg";
import { MdWarning, MdWarningAmber } from "react-icons/md";
import FixedSwitch from "../components/single/fixedSwitch";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const router = useRouter();
  const { authenticate } = useAuth();
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!accessKey.trim()) {
      setError("Por favor ingrese una llave de acceso");
      setIsLoading(false);
      return;
    }

    if (authenticate(accessKey.trim())) {
      router.push("/authorized/platform");
    } else {
      setError("Llave de acceso inválida. Acceso denegado.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-white dark:bg-navy-900">
      <FixedSwitch />

      {/* Layout: left form, right image */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 sm:px-10 lg:px-16">
        <div
          className="w-full max-w-[520px] rounded-2xl p-8 sm:p-10 bg-white/95 dark:bg-navy-700/90 border border-black/10 dark:border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] backdrop-blur"
        >
          {/* Títulos */}
          <header className="text-center mb-8">
            <h1 className="text-[32px] md:text-2xl font-semibold tracking-[-0.5px] text-neutral-900 dark:text-neutral-100">
              Plataforma MBT
            </h1>
            <p className="text-base text-neutral-700 dark:text-neutral-200">
              Sistema de Gestión de Transporte
            </p>
          </header>

          {/* Mensaje bienvenida */}
          <div className="bg-neutral-100/80 dark:bg-white/10 rounded-lg p-5 mb-8">
            <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
              Introduzca la clave de acceso para continuar a la plataforma. Por favor, asegúrese de entrar la llave provista por su administrador.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de acceso">
            <div>
              <label
                htmlFor="accessKey"
                className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
              >
                Clave de Acceso
              </label>
              <input
                id="accessKey"
                name="accessKey"
                type="password"
                placeholder="Introducir llave de acceso..."
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 text-base py-4 px-5 outline-none focus:border-black focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition disabled:opacity-60"
                aria-invalid={!!error}
                aria-describedby={error ? "accessKey-error" : undefined}
                required
              />
              {error && (
                <div id="accessKey-error" className="mt-2 flex items-center gap-2 text-red-600">
                  <MdWarning className="size-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 text-lg font-semibold text-white rounded-lg transition active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-[1px] shadow-lg hover:shadow-xl bg-gradient-to-br from-black to-neutral-700"
            >
              {isLoading ? "Verificando..." : "Acceder"}
            </button>

            <hr className="border-neutral-300 dark:border-white/20" />

            {/* Aviso seguridad */}
            <aside className="mt-2 bg-neutral-100/90 dark:bg-white/10 border border-neutral-500/70 dark:border-white/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MdWarningAmber className="size-6 text-amber-500" aria-label="warning" />
                <p className="text-[13px] leading-snug text-neutral-800 dark:text-neutral-100">
                  <strong>Aviso:</strong> Si usted posee una clave de acceso pero su dispositivo no está autorizado, será baneado y su intento de acceso será rechazado.
                </p>
              </div>
            </aside>

            <footer className="pt-6 text-sm text-neutral-500 dark:text-white/80 text-center">
              {new Date().getFullYear()} Plataforma MBT.
            </footer>
          </form>
        </div>
      </div>

      {/* Imagen lateral */}
      <div className="relative hidden w-0 flex-1 md:block">
        <Image
          src={authImg}
          alt="Airplane"
          fill
          className="object-contain p-32 md:object-cover object-center rounded-bl-[120px] xl:rounded-bl-[200px]"
          priority
        />
      </div>
    </div>
  );
}

