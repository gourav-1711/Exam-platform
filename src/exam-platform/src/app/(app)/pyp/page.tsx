'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { Download, FileText } from 'lucide-react';

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

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];
const EXAM_TYPES = ['All', 'JEE Main', 'JEE Advanced', 'NEET', 'CBSE Board', 'ICSE Board', 'State Board', 'Other'];
const YEARS = [0, ...Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)];

export default function PypPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedExamType, setSelectedExamType] = useState('All');

  const { data: pdfs = [], isLoading, error } = useQuery({
    queryKey: ['pyp-pdfs'],
    queryFn: () => apiFetch<PypPdf[]>('/document-pyp'),
  });

  const filtered = pdfs.filter((p) =>
    (!selectedYear || p.year === selectedYear) &&
    (selectedSubject === 'All' || p.subject === selectedSubject) &&
    (selectedExamType === 'All' || p.examType === selectedExamType)
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">Previous Year Papers</h1>
          </div>
          <p className="text-slate-400 text-lg">Access exam papers from previous years</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Select Year</label>
              <select
                value={selectedYear ?? 0}
                onChange={(e) => setSelectedYear(e.target.value === '0' ? null : Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>All Years</option>
                {YEARS.slice(1).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Select Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              Failed to load PYP. Please try again later.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg">
              <p className="text-slate-400 text-lg">No papers found for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pdf) => (
                <div key={pdf.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-indigo-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{pdf.title}</h3>
                      <p className="text-slate-400 text-sm">{pdf.subject} • {pdf.year}</p>
                    </div>
                    <FileText className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                  </div>

                  <div className="space-y-3 mb-4 text-sm text-slate-400">
                    <p>Exam: {pdf.examType}</p>
                    <p>Size: {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Uploaded: {new Date(pdf.uploadedAt).toLocaleDateString()}</p>
                  </div>

                  <button
                    onClick={() => window.open(pdf.cloudinaryUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="text-center text-slate-400 text-sm">
            Showing {filtered.length} paper{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
