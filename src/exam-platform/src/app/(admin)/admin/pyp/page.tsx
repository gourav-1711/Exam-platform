'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api-config';
import { Upload, Trash2, Download, AlertCircle } from 'lucide-react';

interface PypPdf {
  id: number;
  title: string;
  subject: string;
  year: number;
  examType: string;
  originalName: string;
  cloudinaryUrl: string;
  fileSize: number;
  uploadedAt: string;
}

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'];
const EXAM_TYPES = ['JEE Main', 'JEE Advanced', 'NEET', 'CBSE Board', 'ICSE Board', 'State Board', 'Other'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function PypAdminPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', subject: '', year: new Date().getFullYear().toString(), examType: '', file: null as File | null });
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ['pyp-pdfs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<PypPdf[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pyp-pdfs'] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('year', formData.year);
      data.append('examType', formData.examType);

      const res = await fetch(`${API_BASE_URL}/api/document-pyp/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Upload failed');

      setFormData({ title: '', subject: '', year: new Date().getFullYear().toString(), examType: '', file: null });
      setFileName('');
      queryClient.invalidateQueries({ queryKey: ['pyp-pdfs'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Previous Year Papers Management</h1>
        <p className="text-slate-400 mt-2">Upload and manage exam papers from previous years</p>
      </div>

      {/* Upload Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Upload PYP</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Paper Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              required
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              required
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={formData.examType}
              onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
              required
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Exam Type</option>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-200">{fileName || 'Click to upload or drag and drop'}</p>
              <p className="text-xs text-slate-500 mt-1">PDF or DOC (max 50MB)</p>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !formData.title || !formData.subject || !formData.examType || !formData.file}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {uploading ? 'Uploading...' : 'Upload PYP'}
          </button>
        </form>
      </div>

      {/* PDFs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Previous Year Papers</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Loading...</div>
        ) : pdfs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No PYP uploaded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Exam Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf) => (
                  <tr key={pdf.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-3 text-sm text-white">{pdf.title}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{pdf.subject}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{pdf.year}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{pdf.examType}</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{(pdf.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => window.open(pdf.cloudinaryUrl, '_blank')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(pdf.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
