'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/api-config';
import { Upload, Trash2, Download, AlertCircle } from 'lucide-react';

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

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'English', 'Hindi', 'Political Science', 'Economics', 'Other'];
const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function NcertAdminPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', subject: '', classNumber: '1', file: null as File | null });
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ['ncert-pdfs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/document-ncert`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<NcertPdf[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE_URL}/api/document-ncert/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ncert-pdfs'] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
    }
  };

  const setFile = (file: File) => {
    setFormData(prev => ({ ...prev, file }));
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
      data.append('classNumber', formData.classNumber);

      const res = await fetch(`${API_BASE_URL}/api/document-ncert/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Upload failed');

      setFormData({ title: '', subject: '', classNumber: '1', file: null });
      setFileName('');
      queryClient.invalidateQueries({ queryKey: ['ncert-pdfs'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">NCERT Books Management</h1>
        <p className="text-slate-400 mt-2">Upload and manage NCERT PDF books</p>
      </div>

      {/* Upload Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Upload NCERT PDF</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Book Title"
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

          <select
            value={formData.classNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, classNumber: e.target.value }))}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Class</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>

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
            disabled={uploading || !formData.title || !formData.subject || !formData.file}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {uploading ? 'Uploading...' : 'Upload NCERT PDF'}
          </button>
        </form>
      </div>

      {/* PDFs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">NCERT Books</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Loading...</div>
        ) : pdfs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No NCERT PDFs uploaded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Uploaded</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf) => (
                  <tr key={pdf.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-3 text-sm text-white">{pdf.title}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{pdf.subject}</td>
                    <td className="px-6 py-3 text-sm text-slate-300">{pdf.classNumber}</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{(pdf.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                    <td className="px-6 py-3 text-sm text-slate-400">{new Date(pdf.uploadedAt).toLocaleDateString()}</td>
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