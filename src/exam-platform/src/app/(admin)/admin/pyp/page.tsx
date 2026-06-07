"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { Upload, Trash2, Download, AlertCircle, FileText, ChevronRight, Eye } from "lucide-react";
import { useListPyqSubjects } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion } from "framer-motion";

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
  const { toast } = useToast();

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: new Date().getFullYear().toString(),
    examType: "",
    file: null as File | null,
    externalUrl: "",
  });
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  // Dynamic Subjects
  const { data: pyqSubjects = [] } = useListPyqSubjects();

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ["pyp-pdfs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<PypPdf[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE_URL}/api/document-pyp/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pyp-pdfs"] });
      toast({ title: "Deleted", description: "PYP Paper deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
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
    if (uploadMode === "file" && !formData.file) {
      setError("Please select a file to upload");
      return;
    }
    if (uploadMode === "url" && !formData.externalUrl.trim()) {
      setError("Please supply a valid URL");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subject", formData.subject);
      data.append("year", formData.year);
      data.append("examType", formData.examType);

      if (uploadMode === "file" && formData.file) {
        data.append("file", formData.file);
      } else if (uploadMode === "url") {
        data.append("externalUrl", formData.externalUrl.trim());
      }

      const res = await fetch(`${API_BASE_URL}/api/document-pyp/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || "Upload failed");
      }

      setFormData({
        title: "",
        subject: "",
        year: new Date().getFullYear().toString(),
        examType: "",
        file: null,
        externalUrl: "",
      });
      setFileName("");
      toast({ title: "Success", description: "PYP Paper created successfully" });
      queryClient.invalidateQueries({ queryKey: ["pyp-pdfs"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 p-2"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">PYP Papers</h1>
        <p className="text-gray-500 mt-1">Upload PDF past papers or attach external web links dynamically</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Card */}
        <div className="bg-white border border-border/50 rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add PYP Paper</h2>

          {/* Selector Switch */}
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                uploadMode === "file" ? "bg-white text-indigo-700 shadow-xs" : "text-gray-500"
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                uploadMode === "url" ? "bg-white text-indigo-700 shadow-xs" : "text-gray-500"
              }`}
            >
              URL Link
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title *</label>
              <input
                type="text"
                placeholder="Paper title..."
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select</option>
                  {pyqSubjects.map((s: PyqSubject) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Exam Type *</label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, examType: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select</option>
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {uploadMode === "file" ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">
                    {fileName || "Select PDF document"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF max 50MB</p>
                </label>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">External Link URL *</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.externalUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, externalUrl: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11"
            >
              {uploading ? "Publishing..." : "Add PYP Paper"}
            </Button>
          </form>
        </div>

        {/* List Table Card */}
        <div className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-sm lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">PYP Catalog</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading papers...</div>
          ) : pdfs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No PYP papers uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Title</th>
                    <th className="px-6 py-3 font-semibold">Subject</th>
                    <th className="px-6 py-3 font-semibold">Year</th>
                    <th className="px-6 py-3 font-semibold">File Type</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pdfs.map((pdf) => (
                    <tr key={pdf.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-900">{pdf.title}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-500">{pdf.subject}</td>
                      <td className="px-6 py-3.5 text-gray-500 font-bold">{pdf.year} · {pdf.examType}</td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">
                        {pdf.fileSize > 0 ? `${(pdf.fileSize / 1024 / 1024).toFixed(2)} MB` : "External Link"}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => window.open(pdf.cloudinaryUrl, "_blank")}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => setDeleteId(pdf.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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

      <ConfirmDeleteDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) deleteMutation.mutate(deleteTargetId);
        }}
      />
    </motion.div>
  );
}