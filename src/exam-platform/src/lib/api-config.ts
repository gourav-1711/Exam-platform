/**
 * Central API configuration for frontend.
 * Uses NEXT_PUBLIC_API_URL environment variable (set to http://localhost:4000 by default).
 */
export const API_BASE_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:4000";

export const NEXT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
