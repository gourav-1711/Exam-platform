"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListNcertMcqQuestions } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function NcertMcq() {
  const [classNum, setClassNum] = useState<string>("10");
  const [subject, setSubject] = useState<string>("Science");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListNcertMcqQuestions({
    classNum: Number(classNum),
    subject,
    page
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  React.useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
  }, [page, classNum, subject]);

  const handleNext = () => {
    if (data && currentQIndex === data.data.length - 1 && page < data.totalPages) {
      setPage(p => p + 1);
    } else if (data && currentQIndex < data.data.length - 1) {
      setCurrentQIndex(p => p + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col min-h-screen">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">NCERT MCQs</h1>
        <p className="text-muted-foreground">Practice chapter-wise MCQs from NCERT textbooks.</p>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-card border rounded-2xl shadow-sm mb-6">
        <Select value={classNum} onValueChange={(v) => { setClassNum(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            {[6, 7, 8, 9, 10, 11, 12].map(c => (
              <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subject} onValueChange={(v) => { setSubject(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="History">History</SelectItem>
            <SelectItem value="Geography">Geography</SelectItem>
            <SelectItem value="Polity">Polity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      ) : !data || data.data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-card border rounded-3xl">
          No questions available for this combination.
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${currentQIndex}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-card border-2 border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-sm flex-1"
            >
              <div className="text-sm font-bold text-emerald-600 mb-4 flex items-center justify-between">
                <span>Class {classNum} • {subject}</span>
                <span>Question {currentQIndex + 1 + (page - 1) * 10}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                {data.data[currentQIndex].text}
              </h2>

              <div className="space-y-3">
                {data.data[currentQIndex].options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = showAnswer && data.data[currentQIndex].correctIndex === i;
                  const isWrongSelected = showAnswer && isSelected && !isCorrect;
                  
                  let bgClass = "bg-background hover:bg-muted border-border";
                  if (isSelected && !showAnswer) bgClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 shadow-sm";
                  if (isCorrect) bgClass = "bg-emerald-500 border-emerald-600 text-white font-medium";
                  if (isWrongSelected) bgClass = "bg-destructive/10 border-destructive text-destructive";

                  return (
                    <div
                      key={i}
                      onClick={() => !showAnswer && setSelectedOption(i)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                        bgClass,
                        showAnswer && "cursor-default"
                      )}
                    >
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                      {isWrongSelected && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {showAnswer && data.data[currentQIndex].explanation && (
                <div className="mt-8 p-5 rounded-xl bg-muted/50 border">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Note
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {data.data[currentQIndex].explanation}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentQIndex > 0) setCurrentQIndex(p => p - 1);
                else if (page > 1) setPage(p => p - 1);
              }}
              disabled={currentQIndex === 0 && page === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Prev
            </Button>
            
            {!showAnswer ? (
              <Button
                onClick={() => setShowAnswer(true)}
                disabled={selectedOption === null}
                className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQIndex === data.data.length - 1 && page === data.totalPages}
                className="rounded-xl px-8"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
