'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api-config';
import { Download, BookOpen } from 'lucide-react';

interface NcertPdf {
  id: number;
  title: string;
  subject: string;
  classNumber: number;
  cloudinaryUrl: string;
  fileSize: number;
  uploadedAt: string;
}

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'English', 'Hindi', 'Political Science', 'Economics', 'Other'];
const CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function NcertBooksPage() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('All');

  const { data: pdfs = [], isLoading, error } = useQuery({
    queryKey: ['ncert-pdfs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/document-ncert`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<NcertPdf[]>;
    },
  });

  const filtered = pdfs.filter((p) =>
    (!selectedClass || p.classNumber === selectedClass) &&
    (selectedSubject === 'All' || p.subject === selectedSubject)
  );

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">NCERT Books</h1>
          </div>
          <p className="text-slate-400 text-lg">Access NCERT textbooks for all classes and subjects</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Select Class</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedClass(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedClass === null
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
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
          </div>
        </div>

        {/* Books Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              Failed to load NCERT books. Please try again later.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg">
              <p className="text-slate-400 text-lg">No NCERT books found for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pdf) => (
                <div key={pdf.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-indigo-500 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{pdf.title}</h3>
                      <p className="text-slate-400 text-sm">Class {pdf.classNumber} • {pdf.subject}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                  </div>

                  <div className="space-y-3 mb-4 text-sm text-slate-400">
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
            Showing {filtered.length} NCERT book{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
