'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '@/components/shared/PageTransition';
import { apiFetch } from '@/lib/api/client';
import { Download, FileText, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

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

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function PypPage() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");

  const { data: pdfs = [], isLoading, error } = useQuery({
    queryKey: ['pyp-pdfs', selectedYear, selectedExamType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedYear !== "all") params.set("year", selectedYear);
      if (selectedExamType !== "all") params.set("examType", selectedExamType);
      const query = params.toString();
      return apiFetch<PypPdf[]>(`/document-pyp${query ? `?${query}` : ""}`);
    },
  });

  return (
    <PageTransition className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Previous Year Papers</h1>
        <p className="text-gray-500">Download official question papers and answer keys for competitive exams.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px] bg-white border-gray-300">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
          <SelectTrigger className="w-[200px] bg-white border-gray-300">
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
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            Failed to load papers. Please try again later.
          </div>
        ) : pdfs.length === 0 ? (
          <div className="col-span-full">
            <Empty>
              <FileText className="w-10 h-10 text-gray-300" />
              <EmptyTitle>No papers found</EmptyTitle>
              <EmptyDescription>No previous year papers match your current filters. Try a different selection.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <Card key={pdf.id} className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col h-full gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{pdf.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {pdf.year}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {pdf.subject}</span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
                      {pdf.examType}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Size: {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB · Uploaded: {new Date(pdf.uploadedAt).toLocaleDateString()}
                  </div>

                  <Button
                    onClick={() => window.open(pdf.cloudinaryUrl, '_blank')}
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {pdfs.length > 0 && (
        <div className="text-center text-gray-400 text-sm">
          Showing {pdfs.length} paper{pdfs.length !== 1 ? 's' : ''}
        </div>
      )}
    </PageTransition>
  );
}
