"use client";

import { useAdminListDrafts, useDeleteDraft } from "@workspace/api-client-react";
import { FileEdit, Trash2, Clock, HelpCircle, GraduationCap, ArrowRight, MessageSquare, Newspaper, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DraftItem {
  id: number;
  resourceType: string;
  resourceId: number | null;
  createdBy: string;
  content: any;
  lastSavedAt: string;
}

function DraftCard({ draft, onDelete }: { draft: DraftItem; onDelete: () => void }) {
  const content = draft.content || {};
  const title = content.title || content.text || `Untitled ${draft.resourceType} draft`;
  
  const getIcon = () => {
    switch (draft.resourceType) {
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-orange-500" />;
      case "exam":
        return <GraduationCap className="h-4 w-4 text-violet-500" />;
      case "current_affair":
        return <Newspaper className="h-4 w-4 text-blue-500" />;
      case "study_note":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <FileEdit className="h-4 w-4 text-slate-500" />;
    }
  };

  const getHref = () => {
    const editPath = draft.resourceId ? `/${draft.resourceId}/edit` : "/new";
    switch (draft.resourceType) {
      case "quiz":
        return `/admin/quizzes${editPath}`;
      case "exam":
        return `/admin/exams${editPath}`;
      case "current_affair":
        return `/admin/current-affairs${editPath}`;
      case "study_note":
        return `/admin/study-notes${editPath}`;
      default:
        return `/admin/drafts/${draft.id}`;
    }
  };

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-colors group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 p-1.5 bg-slate-800 rounded-lg flex-shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Saved {new Date(draft.lastSavedAt).toLocaleString()}</span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 font-extrabold rounded-full uppercase">{draft.resourceType}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <Button variant="ghost" size="sm" asChild className="hover:bg-slate-800 text-slate-300 hover:text-white">
          <Link href={getHref()}><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DraftsPage() {
  const { toast } = useToast();

  const { data: drafts = [], isLoading } = useAdminListDrafts();
  const deleteDraft = useDeleteDraft();

  const handleDelete = async (id: number) => {
    try {
      await deleteDraft.mutateAsync(id);
      toast({ title: "Draft deleted" });
    } catch {
      toast({ title: "Failed to delete draft", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileEdit className="w-8 h-8 text-indigo-400" />
          Drafts
        </h1>
        <p className="text-slate-400 mt-2">Resume editing unsaved quizzes, announcements, study notes, or current affairs</p>
      </div>

      <Card className="border-slate-800 bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-indigo-400" /> Drafts Queue ({drafts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-slate-800 animate-pulse rounded-lg" />)}</div>
          ) : drafts.length === 0 ? (
            <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-2">
              <MessageSquare className="w-12 h-12 opacity-30" />
              <p>No active drafts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((d: any) => (
                <DraftCard key={d.id} draft={d} onDelete={() => handleDelete(d.id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}