"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListPyp } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, Clock } from "lucide-react";

export default function Pyp() {
  const [examName, setExamName] = useState<string>("all");
  
  const { data: papers, isLoading } = useListPyp({
    examName: examName !== "all" ? examName : undefined,
  });

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Previous Year Papers</h1>
        <p className="text-muted-foreground">Download official question papers and answer keys.</p>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-card border rounded-2xl shadow-sm">
        <Select value={examName} onValueChange={setExamName}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            <SelectItem value="UPSC CSE">UPSC CSE</SelectItem>
            <SelectItem value="SSC CGL">SSC CGL</SelectItem>
            <SelectItem value="RRB NTPC">RRB NTPC</SelectItem>
            <SelectItem value="RAS">RAS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
        ) : papers?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border rounded-2xl">
            No papers found for selected exam.
          </div>
        ) : (
          papers?.map((paper) => (
            <Card key={paper.id} className="card-hover border-border/50 rounded-2xl bg-card overflow-hidden">
              <CardContent className="p-5 flex flex-col h-full gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-red-500/10 text-red-600 text-xs font-bold rounded-md mb-3">
                    {paper.examName}
                  </span>
                  <div className="flex items-center gap-4 text-sm font-medium text-foreground mb-1">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-muted-foreground" /> Year {paper.year}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-muted-foreground" /> {paper.shiftName}</span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <Button variant="outline" className="w-full rounded-xl justify-start">
                    <Download className="w-4 h-4 mr-3 text-muted-foreground" /> Question Paper
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl justify-start bg-muted/50 border-transparent">
                    <Download className="w-4 h-4 mr-3 text-muted-foreground" /> Answer Key
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
