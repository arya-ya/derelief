import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Trigger redeploy with new root directory configuration */
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
