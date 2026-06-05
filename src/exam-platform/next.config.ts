import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  },
};

export default nextConfig;
