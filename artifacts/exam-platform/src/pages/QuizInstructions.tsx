"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/PageTransition";
import { useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, FileText, Settings, ArrowLeft } from "lucide-react";

export default function QuizInstructions() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { data: quiz, isLoading, isError } = useGetQuiz(Number(id), { query: { enabled: !!id, queryKey: getGetQuizQueryKey(Number(id)) } });

  if (isLoading) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageTransition>
    );
  }

  if (isError || !quiz) {
    return (
      <PageTransition className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 text-center">
        <div className="py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Quiz Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The quiz you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/quiz")}>Back to Quizzes</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/quiz">
        <Button variant="ghost" className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
        </Button>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
            {quiz.subject}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
        <p className="text-muted-foreground">Read the instructions carefully before starting.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon={Clock} label="Duration" value={`${quiz.durationMins} Minutes`} />
        <StatBox icon={FileText} label="Questions" value={quiz.questionCount.toString()} />
        <StatBox icon={Settings} label="Max Marks" value={(quiz.questionCount * 1).toString()} />
        <StatBox icon={AlertCircle} label="Negative" value={`-${quiz.negativeMarking} per wrong`} />
      </div>

      <Card className="border-border/50 rounded-2xl shadow-sm bg-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Instructions</h3>
          <div className="prose prose-sm md:prose-base text-muted-foreground max-w-none">
            <p>{quiz.instructions}</p>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li>The timer will start immediately when you click the Start button.</li>
              <li>Do not refresh the page or press the back button during the quiz.</li>
              <li>You can navigate between questions using the palette or next/prev buttons.</li>
              <li>The quiz will be auto-submitted when the time is up.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Link href={`/quiz/${id}/play`} className="flex-1">
              <Button size="lg" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14">
                Start Test Now
              </Button>
            </Link>
            <Link href="/quiz" className="flex-1">
              <Button size="lg" variant="outline" className="w-full rounded-xl h-14 text-lg">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <p className="font-bold text-sm">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
