import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  allowedDevOrigins: ["*.ngrok-free.app"],
};

export default nextConfig;
