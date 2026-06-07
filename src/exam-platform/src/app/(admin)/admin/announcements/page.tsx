"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Megaphone, Check, X, SwitchCamera, ExternalLink, Edit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Announcement {
  id: number;
  title: string;
  body: string | null;
  type: "urgent" | "warning" | "success" | "info";
  isActive: boolean;
  linkText: string | null;
  linkUrl: string | null;
  createdAt: string;
}

const TYPES = ["info", "success", "warning", "urgent"] as const;

export default function AnnouncementsAdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<Announcement["type"]>("info");
  const [isActive, setIsActive] = useState(true);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Delete State
  const [deleteTargetId, setDeleteId] = useState<number | null>(null);

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["admin", "announcements"],
    queryFn: () => customFetch<Announcement[]>("/api/admin/announcements"),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return customFetch<Announcement>("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      closeModal();
      toast({ title: "Created", description: "Announcement created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      return customFetch<Announcement>(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      closeModal();
      toast({ title: "Updated", description: "Announcement updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return customFetch<Announcement>(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast({ title: "Updated", description: "Status changed successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return customFetch<any>(`/api/admin/announcements/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
      toast({ title: "Deleted", description: "Announcement deleted successfully" });
    },
  });

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setTitle("");
    setBody("");
    setType("info");
    setIsActive(true);
    setLinkText("");
    setLinkUrl("");
    setModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setBody(ann.body || "");
    setType(ann.type);
    setIsActive(ann.isActive);
    setLinkText(ann.linkText || "");
    setLinkUrl(ann.linkUrl || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      body: body.trim() || null,
      type,
      isActive,
      linkText: linkText.trim() || null,
      linkUrl: linkUrl.trim() || null,
    };

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-6 p-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            Announcements
          </h1>
          <p className="text-gray-500 mt-2">Publish notice alerts and priority badges for all students</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 font-bold shrink-0">
          <Plus className="w-5 h-5 mr-1" /> Create Announcement
        </Button>
      </div>

      {/* List Table Card */}
      <Card className="border border-border/50 bg-white shadow-sm overflow-hidden rounded-2xl">
        {isLoading ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : announcements.length === 0 ? (
          <div className="p-12">
            <Empty>
              <EmptyTitle>No announcements yet</EmptyTitle>
              <EmptyDescription>Click the button above to publish your first announcement banner.</EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert Notice</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell className="max-w-[280px]">
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{ann.title}</p>
                        {ann.body && <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{ann.body}</p>}
                        {ann.linkUrl && (
                          <span className="text-[10px] font-semibold text-indigo-500 flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> {ann.linkText || "Redirect Link"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ann.type === "urgent"
                            ? "destructive"
                            : ann.type === "warning"
                            ? "outline"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {ann.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleMutation.mutate({ id: ann.id, isActive: !ann.isActive })}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                          ann.isActive
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        }`}
                      >
                        {ann.isActive ? "ACTIVE" : "PAUSED"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(ann)}
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(ann.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Creation / Editing Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl border-border bg-white shadow-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold text-lg">
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Configure alert notice parameters and published links displayed to students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Important Exam Update..."
                required
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description / Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write notice context here..."
                rows={3}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority Tone</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Announcement["type"])}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={String(isActive)}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="true">Active (Now)</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Button / Link Text</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here..."
                className="rounded-xl h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Redirect / Anchor URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/quiz or https://..."
                className="rounded-xl h-10"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingAnnouncement ? "Save Changes" : "Publish Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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