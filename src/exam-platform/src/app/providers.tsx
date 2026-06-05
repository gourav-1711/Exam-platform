"use client";

import dynamic from "next/dynamic";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { QueryProvider } from "@/components/providers/QueryProvider";

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
  { ssr: false },
);

export default function Providers({
  children,
  clerkEnabled: _clerkEnabled,
}: {
  children: React.ReactNode;
  clerkEnabled?: boolean;
}) {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
