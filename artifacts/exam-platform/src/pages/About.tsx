import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">About Manish Ki Pathshala</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Empowering Indian students with premium, accessible education for competitive exams.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-6">M</div>
            <h3 className="text-2xl font-bold">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              We believe that quality education shouldn't be a luxury. Our mission is to democratize exam preparation by providing top-tier study materials, interactive quizzes, and AI-powered support to every student, regardless of their location.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xl mb-6">W</div>
            <h3 className="text-2xl font-bold">Who We Are</h3>
            <p className="text-muted-foreground leading-relaxed">
              We are a team of passionate educators, technologists, and former exam toppers dedicated to building the tools we wish we had during our own preparation journeys.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-card to-muted rounded-3xl overflow-hidden shadow-sm mt-8">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">What We Offer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
            <div className="p-4 bg-background rounded-2xl border shadow-sm">
              <h4 className="font-bold text-primary mb-2">Daily Quizzes</h4>
              <p className="text-sm text-muted-foreground">Keep your mind sharp with curated daily questions.</p>
            </div>
            <div className="p-4 bg-background rounded-2xl border shadow-sm">
              <h4 className="font-bold text-blue-600 mb-2">Current Affairs</h4>
              <p className="text-sm text-muted-foreground">Stay updated with exam-relevant news daily.</p>
            </div>
            <div className="p-4 bg-background rounded-2xl border shadow-sm">
              <h4 className="font-bold text-orange-600 mb-2">PYQ Papers</h4>
              <p className="text-sm text-muted-foreground">Master patterns with previous year questions.</p>
            </div>
            <div className="p-4 bg-background rounded-2xl border shadow-sm">
              <h4 className="font-bold text-emerald-600 mb-2">AI Support</h4>
              <p className="text-sm text-muted-foreground">Instant doubt resolution and concept clarity.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
