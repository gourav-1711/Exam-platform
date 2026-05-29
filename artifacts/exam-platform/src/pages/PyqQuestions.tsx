import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListPyqQuestions, getListPyqQuestionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PyqQuestions() {
  const { subjectId } = useParams();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListPyqQuestions({ subjectId: Number(subjectId), page }, { query: { enabled: !!subjectId, queryKey: getListPyqQuestionsQueryKey({ subjectId: Number(subjectId), page }) } });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset state when changing pages
  React.useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
  }, [page, data]);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-3xl" /></div>;
  }

  if (!data || data.data.length === 0) {
    return (
      <PageTransition className="p-8 text-center max-w-3xl mx-auto">
        <Link href="/pyq">
          <Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
        <p className="text-muted-foreground">No questions found for this subject.</p>
      </PageTransition>
    );
  }

  const questions = data.data;
  const currentQ = questions[currentQIndex];
  const isLastQ = currentQIndex === questions.length - 1;
  const isFirstQ = currentQIndex === 0;

  const handleNext = () => {
    if (isLastQ && page < data.totalPages) {
      setPage(p => p + 1);
    } else if (!isLastQ) {
      setCurrentQIndex(p => p + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (isFirstQ && page > 1) {
      setPage(p => p - 1);
    } else if (!isFirstQ) {
      setCurrentQIndex(p => p - 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col h-full min-h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-6">
        <Link href="/pyq">
          <Button variant="ghost" className="-ml-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
          </Button>
        </Link>
        <div className="text-sm font-medium">
          Question {currentQIndex + 1 + (page - 1) * 10} of {data.total}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${currentQIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm flex-1"
          >
            {currentQ.examLabel && (
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-orange-600 bg-orange-500/10 rounded-full">
                {currentQ.examLabel}
              </span>
            )}

            <div className="flex items-start gap-4 mb-8">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                Q
              </div>
              <h2 className="text-xl md:text-2xl font-medium leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = showAnswer && currentQ.correctIndex === i;
                const isWrongSelected = showAnswer && isSelected && !isCorrect;
                
                let bgClass = "bg-background hover:bg-muted border-border/50";
                if (isSelected && !showAnswer) bgClass = "bg-primary/5 border-primary text-primary shadow-sm";
                if (isCorrect) bgClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-medium";
                if (isWrongSelected) bgClass = "bg-destructive/10 border-destructive text-destructive";

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (!showAnswer) setSelectedOption(i);
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                      bgClass,
                      showAnswer && "cursor-default"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                      isSelected && !showAnswer ? "border-primary bg-primary text-white" : "border-muted-foreground/30",
                      isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                      isWrongSelected && "border-destructive bg-destructive text-white"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isWrongSelected && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
                  </div>
                );
              })}
            </div>

            {showAnswer && currentQ.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 p-5 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900"
              >
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-3">
                  <Lightbulb className="w-5 h-5" /> Explanation
                </div>
                <p className="text-blue-900 dark:text-blue-200 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstQ && page === 1}
            className="rounded-xl h-12 px-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </Button>
          
          {!showAnswer ? (
            <Button
              onClick={() => setShowAnswer(true)}
              disabled={selectedOption === null}
              className="rounded-xl h-12 px-8 bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20"
            >
              Show Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isLastQ && page === data.totalPages}
              className="rounded-xl h-12 px-8 bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              Next Question <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
