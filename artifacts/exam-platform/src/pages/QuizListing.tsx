import React, { useState } from "react";
import { Link } from "wouter";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListQuizzes } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Play, FileText, CheckCircle2 } from "lucide-react";

export default function QuizListing() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const { data: quizzes, isLoading } = useListQuizzes({ status: activeTab as any });

  return (
    <PageTransition className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Daily Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge with our daily curated quizzes.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : quizzes?.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No ongoing quizzes found. Check back tomorrow!
              </div>
            ) : (
              quizzes?.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} type="ongoing" />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : quizzes?.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                You haven't attempted any quizzes yet.
              </div>
            ) : (
              quizzes?.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} type="history" />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}

function QuizCard({ quiz, type }: { quiz: any; type: "ongoing" | "history" }) {
  return (
    <Card className="card-hover border-border/50 rounded-2xl bg-card overflow-hidden flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md inline-block mb-1">
              {quiz.subject}
            </span>
            <h3 className="font-bold text-foreground line-clamp-2 leading-tight">{quiz.title}</h3>
          </div>
          {type === "history" && (
            <div className="shrink-0 p-1.5 bg-emerald-500/10 rounded-full text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {quiz.durationMins} mins
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> {quiz.questionCount} Qs
          </div>
          <div className="col-span-2 text-xs">
            Negative Marking: -{quiz.negativeMarking}
          </div>
        </div>

        {type === "ongoing" && (
          <Link href={`/quiz/${quiz.id}`}>
            <Button className="w-full mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" /> Start Quiz
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
