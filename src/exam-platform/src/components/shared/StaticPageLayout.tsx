"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "./PageTransition";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  heading: string;
  children: React.ReactNode;
}


export function StaticPageLayout({ title, subtitle = "Explore premium educational resources", heading, children }: StaticPageLayoutProps) {
  const router = useRouter();

  return (
    <PageTransition className="min-h-screen bg-gray-50 flex flex-col">

      <div className="bg-white border-b border-border/60 px-4 py-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="size-5" />
          <span className="font-semibold text-lg">Back</span>
        </button>
        {/* <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p> */}
      </div>

      <div className="flex-1 px-4 pt-6 pb-4 max-w-2xl w-full mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">{heading}</h1>
          <div className="mt-1.5 w-14 h-[3px] rounded-full bg-primary" />
        </div>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 space-y-4 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      </div>

    </PageTransition>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-base text-foreground mt-4 mb-1.5">{children}</h3>;
}

export function SectionText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#374151] leading-relaxed">{children}</p>;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}
