import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useGetStats, useListQuizzes, useListCurrentAffairs, useListStudyNotes } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronRight, Play, BookOpen, Clock, Users, BookMarked, Trophy, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: quizzes, isLoading: isLoadingQuizzes } = useListQuizzes({ status: "ongoing" });
  const { data: news, isLoading: isLoadingNews } = useListCurrentAffairs({ limit: 5 });

  return (
    <PageTransition className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-primary to-purple-800 p-6 md:p-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Accelerate your exam prep with <span className="text-purple-200">Manish Ki Pathshala</span>
          </h1>
          <p className="text-purple-100 md:text-lg opacity-90 max-w-xl">
            Premium study materials, daily quizzes, and mock tests for UPSC, SSC, and State PCS. Everything you need to succeed, in one place.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Link href="/quiz">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-xl font-semibold">
                Start Daily Quiz
              </Button>
            </Link>
            <Link href="/mock-tests">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm">
                Explore Mock Tests
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon={Users} label="Active Students" value={stats?.users?.toLocaleString() || "0"} />
            <StatCard icon={Trophy} label="Questions Practiced" value={stats?.questions?.toLocaleString() || "0"} />
            <StatCard icon={BookMarked} label="Study Notes" value={stats?.studyNotesCount?.toLocaleString() || "0"} />
            <StatCard icon={Newspaper} label="Current Affairs" value={stats?.currentAffairsCount?.toLocaleString() || "0"} />
          </>
        )}
      </section>

      {/* Daily Free Quizzes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Daily Free Quizzes
          </h2>
          <Link href="/quiz">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-3 gap-4 snap-x">
          {isLoadingQuizzes ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-72 md:w-auto h-40 rounded-2xl shrink-0 snap-start" />)
          ) : quizzes?.slice(0, 3).map((quiz) => (
            <Card key={quiz.id} className="w-72 md:w-auto shrink-0 snap-start card-hover border-border/50 rounded-2xl overflow-hidden bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {quiz.subject}
                    </span>
                    <h3 className="font-bold text-foreground line-clamp-2 leading-tight">{quiz.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {quiz.durationMins}m
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileTextIcon className="w-4 h-4" /> {quiz.questionCount} Qs
                  </div>
                </div>
                <Link href={`/quiz/${quiz.id}`}>
                  <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90">
                    <Play className="w-4 h-4 mr-2" /> Start Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Current Affairs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            Latest Current Affairs
          </h2>
          <Link href="/current-affairs">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              Read More <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {isLoadingNews ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : news?.data.slice(0, 4).map((article) => (
            <Link key={article.id} href={`/current-affairs/${article.id}`}>
              <Card className="card-hover border-border/50 rounded-2xl cursor-pointer bg-card overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-sm">
                        {article.category}
                      </span>
                      <span className="text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <h3 className="font-bold text-foreground line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{article.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAccessCard href="/pyq" title="PYQ Papers" icon={FileTextIcon} color="bg-orange-500" />
        <QuickAccessCard href="/ncert-books" title="NCERT Books" icon={BookOpen} color="bg-emerald-500" />
        <QuickAccessCard href="/study-notes" title="Study Notes" icon={BookMarked} color="bg-pink-500" />
        <QuickAccessCard href="/support" title="AI Support" icon={MessageCircleIcon} color="bg-primary" />
      </section>

    </PageTransition>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm bg-card">
      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-2">
        <div className="p-2 md:p-3 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({ href, title, icon: Icon, color }: { href: string, title: string, icon: any, color: string }) {
  return (
    <Link href={href}>
      <Card className="card-hover border-border/50 rounded-2xl cursor-pointer bg-card h-full group">
        <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
          <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm md:text-base">{title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

// Fallback icons to avoid missing imports
function FileTextIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
}

function MessageCircleIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
}
