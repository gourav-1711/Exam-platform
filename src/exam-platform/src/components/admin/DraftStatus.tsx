"use client";

import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";

export function DraftStatus() {
  const { status, lastSavedAt, hasUnsavedChanges, errorMessage } = useAppSelector((s) => s.draft);

  if (status === "idle" && !lastSavedAt) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
      status === "saving" && "text-amber-600 bg-amber-50",
      status === "saved" && "text-green-600 bg-green-50",
      status === "error" && "text-red-600 bg-red-50",
      hasUnsavedChanges && status === "idle" && "text-gray-500 bg-gray-50",
    )}>
      {status === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving draft...</>}
      {status === "saved" && !hasUnsavedChanges && (
        <>
          <Check className="h-3 w-3" />
          Draft saved {lastSavedAt ? formatTime(lastSavedAt) : ""}
        </>
      )}
      {status === "error" && <><AlertCircle className="h-3 w-3" /> {errorMessage ?? "Failed to save"}</>}
      {hasUnsavedChanges && status === "idle" && <><Clock className="h-3 w-3" /> Unsaved changes</>}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60000) return "just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
