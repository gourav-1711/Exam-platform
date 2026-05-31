"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
  { ssr: false }
);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  });
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

const ClerkCacheInvalidatorDynamic = dynamic(
  () => Promise.resolve(ClerkQueryClientCacheInvalidator),
  { ssr: false }
);

export default function Providers({
  children,
  clerkEnabled,
}: {
  children: React.ReactNode;
  clerkEnabled?: boolean;
}) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {clerkEnabled ? <ClerkCacheInvalidatorDynamic /> : null}
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
