"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListPyp } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Download, Calendar, Clock, FileText } from "lucide-react";

export default function Pyp() {
  const [examName, setExamName] = useState<string>("all");
  
  const { data: papers, isLoading } = useListPyp({
    examName: examName !== "all" ? examName : undefined,
  });

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Previous Year Papers</h1>
        <p className="text-gray-500">Download official question papers and answer keys.</p>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Select value={examName} onValueChange={setExamName}>
          <SelectTrigger className="w-[200px] bg-white border-gray-300">
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
          <div className="col-span-full">
            <Empty>
              <FileText className="w-10 h-10 text-gray-300" />
              <EmptyTitle>No papers found</EmptyTitle>
              <EmptyDescription>No previous year papers found for the selected exam. Try a different selection.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          papers?.map((paper) => (
            <Card key={paper.id} className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col h-full gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md mb-3">
                    {paper.examName}
                  </span>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Year {paper.year}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {paper.shiftName}</span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <Button variant="outline" className="w-full rounded-xl justify-start border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-3 text-gray-400" /> Question Paper
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl justify-start bg-gray-50/50 border-gray-100 text-gray-700 hover:bg-gray-100">
                    <Download className="w-4 h-4 mr-3 text-gray-400" /> Answer Key
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
