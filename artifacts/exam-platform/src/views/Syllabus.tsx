"use client";

import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListSyllabus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye } from "lucide-react";

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
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-2xl">
            No syllabus records found.
          </div>
        ) : (
          syllabi?.map((item) => (
            <Card key={item.id} className="card-hover border-border/50 rounded-2xl bg-card">
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.examName}</h3>
                  <p className="text-xs text-muted-foreground">Updated Syllabus</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-500/10 hover:text-blue-600">
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageTransition>
  );
}
