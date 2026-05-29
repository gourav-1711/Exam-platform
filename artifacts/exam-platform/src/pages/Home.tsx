import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import {
  useGetStats, useListQuizzes, useListCurrentAffairs,
  useListStudyNotes, useListMockTests, useListPyp, useListNcertBooks
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  ChevronRight, Play, BookOpen, Clock, Users, BookMarked,
  Trophy, Newspaper, Download, GraduationCap, Library,
  FileText, ScrollText, Calendar, Award, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function Home() {
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: quizzes, isLoading: isLoadingQuizzes } = useListQuizzes({ status: "ongoing" });
  const { data: news, isLoading: isLoadingNews } = useListCurrentAffairs({ limit: 4 });
  const { data: notesData, isLoading: isLoadingNotes } = useListStudyNotes({});
  const { data: mockTests, isLoading: isLoadingMocks } = useListMockTests();
  const { data: papers, isLoading: isLoadingPapers } = useListPyp({});
  const { data: books, isLoading: isLoadingBooks } = useListNcertBooks({});

  return (
    <PageTransition className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-primary to-purple-800 p-6 md:p-10 text-white shadow-xl">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            India's Premier Exam Prep Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Accelerate your exam prep with{" "}
            <span className="text-purple-200">Manish Ki Pathshala</span>
          </h1>
          <p className="text-purple-100 md:text-lg opacity-90 max-w-xl leading-relaxed">
            Premium study materials, daily quizzes, and mock tests for UPSC, SSC, RAS, and State PCS.
            Everything you need to succeed, in one place.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/quiz">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-xl font-bold shadow-lg shadow-black/20">
                <Play className="w-4 h-4 mr-2" /> Start Daily Quiz
              </Button>
            </Link>
            <Link href="/mock-tests">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm">
                <GraduationCap className="w-4 h-4 mr-2" /> Explore Mock Tests
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : (
            <>
              <StatCard icon={Users} label="Active Students" value={stats?.users?.toLocaleString() || "0"} color="text-violet-600 bg-violet-500/10" />
              <StatCard icon={Trophy} label="Questions" value={(stats?.questions || 0) > 999 ? `${((stats?.questions || 0) / 1000).toFixed(1)}K` : stats?.questions?.toString() || "0"} color="text-amber-600 bg-amber-500/10" />
              <StatCard icon={BookMarked} label="Study Notes" value={stats?.studyNotesCount?.toString() || "0"} color="text-emerald-600 bg-emerald-500/10" />
              <StatCard icon={Newspaper} label="Current Affairs" value={stats?.currentAffairsCount?.toString() || "0"} color="text-blue-600 bg-blue-500/10" />
            </>
          )}
      </section>

      {/* ── Daily Free Quizzes ── */}
      <Section title="Daily Free Quizzes" href="/quiz" accent="bg-primary">
        <div className="flex overflow-x-auto pb-3 -mx-4 px-4 md:grid md:grid-cols-3 gap-4 snap-x scrollbar-none">
          {isLoadingQuizzes
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-72 md:w-auto h-44 rounded-2xl shrink-0 snap-start" />)
            : quizzes?.slice(0, 3).map((quiz, i) => (
              <motion.div key={quiz.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                className="w-72 md:w-auto shrink-0 snap-start">
                <Card className="h-full card-hover border-border/50 rounded-2xl overflow-hidden bg-card">
                  <CardContent className="p-5 space-y-4 flex flex-col h-full">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                        {quiz.subject}
                      </span>
                      <h3 className="font-bold text-foreground line-clamp-2 leading-snug mt-1">{quiz.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {quiz.durationMins}m</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {quiz.questionCount} Qs</span>
                    </div>
                    <Link href={`/quiz/${quiz.id}`} className="mt-auto block">
                      <Button className="w-full rounded-xl" size="sm">
                        <Play className="w-3.5 h-3.5 mr-1.5" /> Start Quiz
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── Latest Current Affairs ── */}
      <Section title="Latest Current Affairs" href="/current-affairs" accent="bg-blue-500">
        <div className="grid md:grid-cols-2 gap-4">
          {isLoadingNews
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : news?.data.slice(0, 4).map((article, i) => (
              <motion.div key={article.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                <Link href={`/current-affairs/${article.id}`}>
                  <Card className="card-hover border-border/50 rounded-2xl cursor-pointer bg-card overflow-hidden h-full">
                    <CardContent className="p-4 flex gap-4 h-full">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md">{article.category}</span>
                          <span className="text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground line-clamp-2 text-sm leading-snug">{article.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{article.summary}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── Study Notes ── */}
      <Section title="Study Notes" href="/study-notes" accent="bg-pink-500">
        <div className="flex overflow-x-auto pb-3 -mx-4 px-4 md:grid md:grid-cols-4 gap-4 snap-x scrollbar-none">
          {isLoadingNotes
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="w-56 md:w-auto h-36 rounded-2xl shrink-0 snap-start" />)
            : notesData?.data.slice(0, 4).map((note, i) => (
              <motion.div key={note.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                className="w-56 md:w-auto shrink-0 snap-start">
                <Card className="h-full card-hover border-border/50 rounded-2xl bg-card overflow-hidden">
                  <CardContent className="p-4 flex flex-col h-full gap-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded-md">{note.subject}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">{note.medium}</span>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{note.title}</h3>
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs h-8 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <BookOpen className="w-3 h-3 mr-1" /> Read
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── Mock Tests ── */}
      <Section title="Full Length Mock Tests" href="/mock-tests" accent="bg-amber-500">
        <div className="flex overflow-x-auto pb-3 -mx-4 px-4 md:grid md:grid-cols-3 gap-4 snap-x scrollbar-none">
          {isLoadingMocks
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-72 md:w-auto h-52 rounded-2xl shrink-0 snap-start" />)
            : mockTests?.slice(0, 3).map((test, i) => (
              <motion.div key={test.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                className="w-72 md:w-auto shrink-0 snap-start">
                <Card className="h-full card-hover border-border/50 rounded-2xl bg-card overflow-hidden relative border-t-4 border-t-primary">
                  {test.isFeatured && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  <CardContent className="p-5 flex flex-col h-full gap-3">
                    <div>
                      <h3 className="font-bold leading-snug pr-12 line-clamp-2">{test.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 mt-auto">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.durationMins}m</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {test.questionCount} Qs</span>
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {test.maxMarks} Marks</span>
                    </div>
                    <Link href={`/mock-tests/${test.id}`}>
                      <Button className="w-full rounded-xl" size="sm">
                        <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Launch Session
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── Previous Year Papers ── */}
      <Section title="Previous Year Papers" href="/pyp" accent="bg-red-500">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingPapers
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : papers?.slice(0, 3).map((paper, i) => (
              <motion.div key={paper.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                <Card className="card-hover border-border/50 rounded-2xl bg-card overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-red-500/10 text-red-600 text-[10px] font-bold rounded-md mb-2">{paper.examName}</span>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {paper.year}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {paper.shiftName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-8">
                        <Download className="w-3 h-3 mr-1" /> Question Paper
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-8">
                        <Download className="w-3 h-3 mr-1" /> Answer Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── NCERT Books ── */}
      <Section title="NCERT Books" href="/ncert-books" accent="bg-emerald-500">
        <div className="flex overflow-x-auto pb-3 -mx-4 px-4 md:grid md:grid-cols-4 gap-4 snap-x scrollbar-none">
          {isLoadingBooks
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="w-44 md:w-auto h-52 rounded-2xl shrink-0" />)
            : books?.slice(0, 4).map((book, i) => (
              <motion.div key={book.id} custom={i} initial="hidden" animate="visible" variants={cardVariants}
                className="w-44 md:w-auto shrink-0 snap-start">
                <Card className="h-full card-hover border-border/50 rounded-2xl bg-card overflow-hidden flex flex-col">
                  <div className="h-20 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <span className="text-white/90 font-extrabold text-xl tracking-widest">NCERT</span>
                  </div>
                  <CardContent className="p-3 flex flex-col flex-1 gap-2">
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Class {book.classNum} • {book.subject}</span>
                      <h3 className="font-bold text-xs leading-snug mt-1 line-clamp-2">{book.title}</h3>
                    </div>
                    <div className="flex gap-1 mt-auto">
                      <Button size="sm" className="flex-1 rounded-lg text-[10px] h-7">
                        <BookOpen className="w-3 h-3 mr-0.5" /> Read
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg shrink-0">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </Section>

      {/* ── Quick Access Grid ── */}
      <section>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-4">
          <div className="w-2 h-6 bg-indigo-500 rounded-full" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard href="/pyq" title="PYQ Papers" icon={FileText} gradient="from-orange-400 to-orange-600" />
          <QuickAccessCard href="/ncert-mcq" title="NCERT MCQs" icon={BookOpen} gradient="from-emerald-400 to-teal-600" />
          <QuickAccessCard href="/syllabus" title="Syllabus" icon={ScrollText} gradient="from-blue-400 to-indigo-600" />
          <QuickAccessCard href="/support" title="AI Support" icon={MessageCircle} gradient="from-primary to-violet-600" />
        </div>
      </section>

    </PageTransition>
  );
}

function Section({ title, href, accent, children }: { title: string; href: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <div className={`w-2 h-6 ${accent} rounded-full`} />
          {title}
        </h2>
        <Link href={href}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs">
            View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </Link>
      </div>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm bg-card">
      <CardContent className="p-4 md:p-5 flex flex-col items-center text-center gap-2">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({ href, title, icon: Icon, gradient }: { href: string; title: string; icon: React.ElementType; gradient: string }) {
  return (
    <Link href={href}>
      <Card className="card-hover border-border/50 rounded-2xl cursor-pointer bg-card h-full group">
        <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="font-semibold text-sm">{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
