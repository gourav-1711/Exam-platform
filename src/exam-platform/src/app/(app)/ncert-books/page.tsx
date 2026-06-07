"use client";

import { useState } from "react";
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
import { PyqSubject } from "@workspace/db";

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

const CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function NcertBooksPage() {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">NCERT Books</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Access NCERT textbooks for all classes and subjects
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Class
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedClass(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedClass === null
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {CLASSES.slice(1).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedClass === cls
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Subject
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-full">
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
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Failed to load NCERT books. Please try again later.
            </div>
          ) : pdfs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-600 text-lg">
                No NCERT books found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf) => (
                <Card
                  key={pdf.id}
                  className="border border-gray-200 rounded-2xl bg-white hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {pdf.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Class {pdf.classNumber} • {pdf.subject}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-500">
                      <p>
                        Size:{" "}
                        {pdf.fileSize
                          ? (pdf.fileSize / 1024 / 1024).toFixed(2) + " MB"
                          : "External Link"}
                      </p>
                      <p>
                        Uploaded:{" "}
                        {new Date(pdf.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      onClick={() => window.open(pdf.cloudinaryUrl, "_blank")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
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

            <span className="text-sm text-gray-600 px-3">
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
          <div className="text-center text-gray-500 text-sm">
            Showing {pdfs.length} NCERT book{pdfs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}