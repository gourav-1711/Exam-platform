"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTransition } from "@/components/shared/PageTransition";
import { useGetCurrentAffair, getGetCurrentAffairQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Share2, Tag, ChevronLeft, ChevronRight } from "lucide-react";

export default function CurrentAffairDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: article, isLoading, isError } = useGetCurrentAffair(Number(id), { query: { enabled: !!id, queryKey: getGetCurrentAffairQueryKey(Number(id)) } });

  if (isLoading) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </PageTransition>
    );
  }

  if (isError || !article) {
    return (
      <div className="p-8 text-center text-muted-foreground">Article not found.</div>
    );
  }

  return (
    <PageTransition className="p-4 md:p-8 max-w-3xl mx-auto bg-background min-h-screen">
      <Link href="/current-affairs">
        <Button variant="ghost" className="-ml-4 mb-4 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {article.tags?.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
              <Tag className="w-3 h-3" />{tag}
            </span>
          ))}
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Calendar className="w-3 h-3" />
            {new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">{article.title}</h1>

        {article.summary && (
          <p className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 italic">
            {article.summary}
          </p>
        )}

        <div
          className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />
      </div>

      <div className="mt-10 pt-6 border-t flex items-center justify-between">
        <Link href="/current-affairs">
          <Button variant="outline" className="rounded-xl gap-2">
            <ChevronLeft className="w-4 h-4" /> All Articles
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
          className="rounded-xl gap-2"
        >
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>
    </PageTransition>
  );
}
