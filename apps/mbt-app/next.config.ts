import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow ESLint warnings without failing the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript errors without failing the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
