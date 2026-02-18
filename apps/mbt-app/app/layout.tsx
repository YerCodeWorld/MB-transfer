import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Providers } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MB Transfer Platform",
  description: "Platform for MB Transfer Transport Compnay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  

  return (
    <html lang="en" className="" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo-mini.png" />
      </head>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <Toaster
              position="top-right"
              richColors
            />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
