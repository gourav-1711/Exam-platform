"use client";

import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { DocumentActionButton } from "@/components/shared/DocumentActionButton";
import { useListSyllabus } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FileText, BookOpen } from "lucide-react";

export default function Syllabus() {
  const { data: syllabi, isLoading } = useListSyllabus();

  return (
    <PageTransition className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exam Syllabus</h1>
        <p className="text-muted-foreground">Official detailed syllabus for all major competitive exams.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : syllabi?.length === 0 ? (
          <div className="col-span-full">
            <Empty>
              <BookOpen className="w-10 h-10 text-gray-300" />
              <EmptyTitle>No syllabus records</EmptyTitle>
              <EmptyDescription>No syllabus records are currently available. Check back later for updates.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          syllabi?.map((item) => (
            <Card key={item.id} className="card-hover border-border/50 rounded-2xl bg-card">
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  {item.examCategory && (
                    <p className="text-xs text-muted-foreground">{item.examCategory}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {item.readUrl && (
                    <DocumentActionButton
                      url={item.readUrl}
                      page="syllabus"
                      action="read"
                      label="Read"
                      className="rounded-full hover:bg-blue-500/10 hover:text-blue-600 w-9 h-9 p-0 flex items-center justify-center"
                    />
                  )}
                  {item.downloadUrl && (
                    <DocumentActionButton
                      url={item.downloadUrl}
                      page="syllabus"
                      action="download"
                      label="Download"
                      className="rounded-full hover:bg-primary/10 hover:text-primary w-9 h-9 p-0 flex items-center justify-center"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageTransition>
  );
}
