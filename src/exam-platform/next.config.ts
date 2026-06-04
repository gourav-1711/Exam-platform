import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  },
  transpilePackages: ["@workspace/api-client-react"],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tanstack/react-query": require.resolve("@tanstack/react-query"),
    };
    return config;
  },
};

export default nextConfig;
