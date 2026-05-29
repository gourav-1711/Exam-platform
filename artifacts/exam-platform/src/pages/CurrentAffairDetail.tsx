import React from "react";
import { Link, useParams } from "wouter";
import { PageTransition } from "@/components/shared/PageTransition";
import { useGetCurrentAffair, getGetCurrentAffairQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Share2, Tag, ChevronLeft, ChevronRight } from "lucide-react";

export default function CurrentAffairDetail() {
  const { id } = useParams();
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
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
        </Button>
      </Link>

      <article className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-md">
              <Tag className="w-3 h-3" /> {article.category}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground">
            {article.title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed border-l-4 border-primary pl-4 py-1">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 py-4 border-y border-border/50">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: article.title,
                url: window.location.href,
              });
            }
          }}>
            <Share2 className="w-4 h-4 mr-2" /> Share Article
          </Button>
        </div>

        {/* Content - mimicking markdown rendering */}
        <div className="prose prose-slate md:prose-lg max-w-none text-foreground leading-relaxed
          prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary
          prose-p:mb-6 prose-li:mb-2">
          {article.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4 pt-12 pb-8 border-t border-border">
          {article.prevId ? (
            <Link href={`/current-affairs/${article.prevId}`}>
              <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 rounded-xl text-left flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground flex items-center"><ChevronLeft className="w-3 h-3 mr-1" /> Previous</span>
                <span className="font-semibold line-clamp-1 w-full">Read older article</span>
              </Button>
            </Link>
          ) : <div></div>}
          
          {article.nextId && (
            <Link href={`/current-affairs/${article.nextId}`}>
              <Button variant="outline" className="w-full justify-end h-auto py-4 px-4 rounded-xl text-right flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground flex items-center">Next <ChevronRight className="w-3 h-3 ml-1" /></span>
                <span className="font-semibold line-clamp-1 w-full">Read newer article</span>
              </Button>
            </Link>
          )}
        </div>
      </article>
    </PageTransition>
  );
}
