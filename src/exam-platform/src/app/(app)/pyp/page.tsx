"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTransition } from "@/components/shared/PageTransition";

import { DocumentActionButton } from "@/components/shared/DocumentActionButton";
import { apiFetch } from "@/lib/api/client";
import {
  FileText,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import PageHeading from "@/components/shared/PageHeading";

interface PypPdf {
  id: number;
  title: string;
  subject: string;
  year: number;
  examType: string;
  cloudinaryUrl: string;
  fileSize: number;
  uploadedAt: string;
}

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i,
);

export default function PypPage() {
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");

  // Reset to first page when filters change
  const prevFilterKey = useRef(`${selectedYear}:${selectedExamType}`);
  useEffect(() => {
    const key = `${selectedYear}:${selectedExamType}`;
    if (key !== prevFilterKey.current) {
      setPage(1);
      prevFilterKey.current = key;
    }
  }, [selectedYear, selectedExamType]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pyp-pdfs", page, selectedYear, selectedExamType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedYear !== "all") params.set("year", selectedYear);
      if (selectedExamType !== "all") params.set("examType", selectedExamType);
      params.set("page", String(page));
      params.set("limit", "12");
      const query = params.toString();
      return apiFetch<{
        data: PypPdf[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/document-pyp${query ? `?${query}` : ""}`);
    },
  });

  const pdfs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition
      className="
    min-h-screen
    max-w-5xl
    mx-auto
    p-4 md:p-8
    space-y-6
    bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
    [background-size:18px_18px]
  "
    >
      <div className="space-y-2">
        <PageHeading heading="Previous Year Papers" />
        <p className="text-gray-500">
          Download official question papers and answer keys for competitive
          exams.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className=" bg-white border-gray-300">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
          <SelectTrigger className=" bg-white border-gray-300">
            <SelectValue placeholder="Exam Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exam Types</SelectItem>
            <SelectItem value="JEE Main">JEE Main</SelectItem>
            <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
            <SelectItem value="NEET">NEET</SelectItem>
            <SelectItem value="CBSE Board">CBSE Board</SelectItem>
            <SelectItem value="State Board">State Board</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Papers Grid */}
      {/* Papers List */}
      <div className="space-y-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            Failed to load papers. Please try again later.
          </div>
        ) : pdfs.length === 0 ? (
          <Empty>
            <FileText className="w-10 h-10 text-gray-300" />
            <EmptyTitle>No papers found</EmptyTitle>
            <EmptyDescription>
              No previous year papers match your current filters.
            </EmptyDescription>
          </Empty>
        ) : (
          pdfs.map((pdf) => (
            <Card
              key={pdf.id}
              className="
          border-2
          border-gray-200
          rounded-[28px]
          bg-white
          shadow-sm
          hover:shadow-md
          transition-all
        "
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-white" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-xl text-gray-900 truncate">
                        {pdf.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-2 text-sm">
                        <span className="font-semibold text-gray-700">
                          {pdf.subject}
                        </span>

                        <span className="text-gray-400">•</span>

                        <span className="font-semibold text-gray-700">
                          {pdf.examType}
                        </span>

                        <span className="text-gray-400">•</span>

                        <span className="font-semibold text-gray-700">
                          {pdf.year}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
                        {new Date(pdf.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <DocumentActionButton
                      url={pdf.cloudinaryUrl}
                      page="pyp"
                      action="read"
                    />

                    <DocumentActionButton
                      url={pdf.cloudinaryUrl}
                      page="pyp"
                      action="download"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Pagination */}
      {data && data.total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {pdfs.length} paper{pdfs.length !== 1 ? "s" : ""}
        </div>
      )}
    </PageTransition>
  );
}
