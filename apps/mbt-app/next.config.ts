import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		// Allow TypeScript errors without failing the build
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
			{
				protocol: "https",
				hostname: "img.freepik.com",
			},
		],
	},
};

export default nextConfig;
