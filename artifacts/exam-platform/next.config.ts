import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.VITE_CLERK_PUBLISHABLE_KEY ??
      process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PROXY_URL: process.env.VITE_CLERK_PROXY_URL,
  },
  allowedDevOrigins: ["*.replit.dev", "*.repl.co", "*.pike.replit.dev"],
  transpilePackages: ["@workspace/api-client-react"],
};

export default nextConfig;
