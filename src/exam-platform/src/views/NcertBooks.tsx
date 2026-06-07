"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { Download, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useListPyqSubjects } from "@/lib/api";
import type { PyqSubject } from "@workspace/db";

interface NcertPdf {
  id: number;
  title: string;
  subject: string;
  classNumber: number;
  originalName: string;
  cloudinaryUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export default function NcertBooks() {
  const [page, setPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Dynamic subjects
  const { data: pyqSubjects = [] } = useListPyqSubjects();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ncert-pdfs", page, selectedClass, selectedSubject],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });
      if (selectedClass) params.set("classNumber", String(selectedClass));
      if (selectedSubject && selectedSubject !== "All")
        params.set("subject", selectedSubject);

      const res = await fetch(`${API_BASE_URL}/api/document-ncert?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{
        data: NcertPdf[];
        total: number;
        page: number;
        totalPages: number;
      }>;
    },
  });

  const pdfs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">NCERT Books</h1>
        <p className="text-muted-foreground">
          Access NCERT textbooks for all classes and subjects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-2xl shadow-sm">
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Select Class
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClass(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedClass === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedClass === cls
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Select Subject
          </label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Subjects</SelectItem>
              {pyqSubjects.map((s: PyqSubject) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            Failed to load NCERT books. Please try again later.
          </div>
        ) : pdfs.length === 0 ? (
          <div className="p-12 text-center bg-card border rounded-2xl">
            <p className="text-muted-foreground text-lg">
              No NCERT books found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <Card
                key={pdf.id}
                className="card-hover border-border/50 rounded-2xl bg-card overflow-hidden flex flex-col"
              >
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {pdf.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Class {pdf.classNumber} • {pdf.subject}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <p>
                      Size:{" "}
                      {pdf.fileSize
                        ? (pdf.fileSize / 1024 / 1024).toFixed(2) + " MB"
                        : "External Link"}
                    </p>
                    <p>
                      Uploaded: {new Date(pdf.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => window.open(pdf.cloudinaryUrl, "_blank")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
        <div className="text-center text-muted-foreground text-sm">
          Showing {pdfs.length} NCERT book{pdfs.length !== 1 ? "s" : ""}
        </div>
      )}
    </PageTransition>
  );
}
