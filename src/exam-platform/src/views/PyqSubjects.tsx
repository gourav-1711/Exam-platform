"use client";

import React from "react";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { PyqSubject } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function PyqSubjects() {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: queryKeys.pyq.subjects(),
    queryFn: () => apiFetch<PyqSubject[]>(`/pyq/subjects`),
    staleTime: 60 * 60 * 1000,
  });

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Previous Year Questions
        </h1>
        <p className="text-muted-foreground">
          Master the exam pattern with subject-wise PYQs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array(8)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : subjects?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No subjects found.
          </div>
        ) : (
          subjects?.map((subject) => (
            <Link key={subject.id} href={`/pyq/${(subject as any).slug ?? subject.id}`}>
              <Card className="card-hover border-border/50 rounded-2xl bg-card cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subject.questionCount} Questions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </PageTransition>
  );
}
