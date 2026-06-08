import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public API routes that don't need Clerk auth
const PUBLIC_API_ROUTES = [
  "/api/document-ncert",
  "/api/document-pyp",
  "/api/health",
  "/api/pyp",
  "/api/pyq",
  "/api/ncert",
  "/api/syllabus",
  "/api/announcements",
  "/api/exam-sets",
  "/api/current-affairs",
];

const isProtectedRoute = createRouteMatcher([
  "/quiz(.*)",
  "/study-notes(.*)",
  "/pyq(.*)",
  "/ncert-mcq(.*)",
  "/mock-tests(.*)",
  "/profile(.*)",
  "/admin(.*)",
]);

const isPublicApiRoute = createRouteMatcher(PUBLIC_API_ROUTES);

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY
);

export default isClerkConfigured ? clerkMiddleware(async (auth, req) => {
  // Skip auth for public API routes
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  return NextResponse.next();
}) : function middleware() {
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
