import React from "react";
import { Link, useParams } from "wouter";
import { PageTransition } from "@/components/shared/PageTransition";
import { useGetMockTest, getGetMockTestQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, FileText, Award, AlertCircle, Play } from "lucide-react";

export default function MockTestDetail() {
  const { id } = useParams();
  const { data: test, isLoading, isError } = useGetMockTest(Number(id), { query: { enabled: !!id, queryKey: getGetMockTestQueryKey(Number(id)) } });

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-[400px] max-w-3xl mx-auto rounded-3xl" /></div>;
  }

  if (isError || !test) {
    return <div className="p-8 text-center text-muted-foreground">Mock test not found.</div>;
  }

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/mock-tests">
        <Button variant="ghost" className="-ml-4 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>

      <Card className="border-border/50 rounded-3xl shadow-sm bg-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-violet-600 relative flex items-end p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          {test.isFeatured && (
            <span className="absolute top-6 right-6 bg-white/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Featured Exam
            </span>
          )}
        </div>
        
        <CardContent className="p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{test.title}</h1>
            <p className="text-lg text-muted-foreground">{test.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <p className="font-bold text-lg">{test.durationMins}m</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
            </div>
            <div className="bg-muted p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <FileText className="w-6 h-6 text-primary mb-2" />
              <p className="font-bold text-lg">{test.questionCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Questions</p>
            </div>
            <div className="bg-muted p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Award className="w-6 h-6 text-primary mb-2" />
              <p className="font-bold text-lg">{test.maxMarks}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Max Marks</p>
            </div>
            <div className="bg-muted p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-6 h-6 text-destructive mb-2" />
              <p className="font-bold text-lg">-{test.negativeMarking}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Negative</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50">
            <h3 className="font-bold text-xl mb-4">Exam Guidelines</h3>
            <ul className="space-y-3 text-muted-foreground list-disc pl-5">
              <li>Ensure you have a stable internet connection.</li>
              <li>Do not switch tabs or windows during the examination.</li>
              <li>The test will auto-submit when the timer runs out.</li>
              <li>You can navigate freely between questions.</li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:flex-1 h-14 rounded-xl text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" /> Start Mock Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
