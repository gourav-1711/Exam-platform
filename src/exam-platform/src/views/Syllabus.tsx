"use client";

import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { DocumentActionButton } from "@/components/shared/DocumentActionButton";
import { useListSyllabus } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FileText, BookOpen } from "lucide-react";

export default function Syllabus() {
  const { data: syllabi, isLoading } = useListSyllabus();

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Syllabus</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Explore premium educational resources
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))
        ) : syllabi?.length === 0 ? (
          <Empty>
            <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            <EmptyTitle>No syllabus records</EmptyTitle>
            <EmptyDescription>
              No syllabus records are currently available.
            </EmptyDescription>
          </Empty>
        ) : (
          syllabi?.map((item) => (
            <div
              key={item.id}
              className="
                flex items-center gap-4
                rounded-3xl border bg-card
                px-4 py-4 md:px-6 md:py-5
                transition-all hover:shadow-sm
              "
            >
              {/* Icon */}
              <div
                className="
                  flex h-14 w-14 shrink-0 items-center justify-center
                  rounded-2xl bg-emerald-500/10
                "
              >
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">
                  {item.title}
                </h3>

                {item.examCategory && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.examCategory}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {item.readUrl && (
                  <DocumentActionButton
                    url={item.readUrl}
                    page="syllabus"
                    action="read"
                    label="Read"
                    className="
                      h-10 px-6 rounded-xl
                      bg-primary text-primary-foreground
                    "
                  />
                )}

                {item.downloadUrl && (
                  <DocumentActionButton
                    url={item.downloadUrl}
                    page="syllabus"
                    action="download"
                    label="Download"
                    className="
                      h-10 px-6 rounded-xl
                      text-primary bg-primary/10 hover:bg-primary/20
                      border bg-background
                    "
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PageTransition>
  );
}
