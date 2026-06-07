"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Megaphone, AlertCircle, Check, X, SwitchCamera, ExternalLink } from "lucide-react";
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

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<Announcement["type"]>("info");
  const [isActive, setIsActive] = useState(true);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

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
      setTitle("");
      setBody("");
      setLinkText("");
      setLinkUrl("");
      toast({ title: "Created", description: "Announcement created" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create", description: err.message, variant: "destructive" });
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
      toast({ title: "Deleted", description: "Announcement deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      body: body.trim() || null,
      type,
      isActive,
      linkText: linkText.trim() || null,
      linkUrl: linkUrl.trim() || null,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-indigo-600" />
          Announcements
        </h1>
        <p className="text-gray-500 mt-2">Publish notice alerts and priority badges for all students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Card */}
        <Card className="border border-border/50 bg-white shadow-sm p-5 h-fit rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> New Alert Banner
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Important Exam Update..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description / Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write notice context here..."
                rows={3}
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
                <Label>Auto Publish</Label>
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
              />
            </div>

            <div className="space-y-1.5">
              <Label>Redirect / Anchor URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/quiz or https://..."
              />
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              {createMutation.isPending ? "Creating..." : "Publish Banner"}
            </Button>
          </form>
        </Card>

        {/* List Table Card */}
        <Card className="border border-border/50 bg-white shadow-sm lg:col-span-2 overflow-hidden rounded-2xl">
          {isLoading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : announcements.length === 0 ? (
            <div className="p-12">
              <Empty>
                <EmptyTitle>No announcements yet</EmptyTitle>
                <EmptyDescription>Fill out the form on the left to publish one.</EmptyDescription>
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
                      <TableCell className="max-w-[240px]">
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{ann.title}</p>
                          {ann.body && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{ann.body}</p>}
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
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                            ann.isActive
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          {ann.isActive ? "ACTIVE" : "PAUSED"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(ann.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}