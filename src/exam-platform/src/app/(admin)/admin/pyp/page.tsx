"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { Upload, Trash2, Download, AlertCircle } from "lucide-react";
import { useListPyqSubjects } from "@/lib/api";
import type { PyqSubject } from "@/lib/api";

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

const EXAM_TYPES = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "CBSE Board",
  "ICSE Board",
  "State Board",
  "Other",
];
const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i,
);

export default function PypAdminPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: new Date().getFullYear().toString(),
    examType: "",
    file: null as File | null,
  });
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ["pyp-pdfs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<PypPdf[]>;
    },
  });

  const { data: subjects = [] } = useListPyqSubjects();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pyp-pdfs"] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError("Please select a file");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("title", formData.title);
      data.append("subject", formData.subject);
      data.append("year", formData.year);
      data.append("examType", formData.examType);

      const res = await fetch(`${API_BASE_URL}/api/document-pyp/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      setFormData({
        title: "",
        subject: "",
        year: new Date().getFullYear().toString(),
        examType: "",
        file: null,
      });
      setFileName("");
      queryClient.invalidateQueries({ queryKey: ["pyp-pdfs"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Previous Year Papers Management
        </h1>
        <p className="text-gray-500 mt-2">
          Upload and manage exam papers from previous years
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload PYP</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Paper Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((s: PyqSubject) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, year: e.target.value }))
              }
              required
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={formData.examType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, examType: e.target.value }))
              }
              required
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Exam Type</option>
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">
                {fileName || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF or DOC (max 50MB)
              </p>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              uploading ||
              !formData.title ||
              !formData.subject ||
              !formData.examType ||
              !formData.file
            }
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {uploading ? "Uploading..." : "Upload PYP"}
          </button>
        </form>
      </div>

      {/* PDFs List */}
      <div className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            Previous Year Papers
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : pdfs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No PYP uploaded yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf) => (
                  <tr
                    key={pdf.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {pdf.title}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {pdf.subject}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {pdf.year}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {pdf.examType}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => window.open(pdf.cloudinaryUrl, "_blank")}
                        className="inline-flex items-center gap-1 px-3 py-1 text-indigo-600 hover:text-indigo-800 font-semibold transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(pdf.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 disabled:opacity-50 transition cursor-pointer"
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