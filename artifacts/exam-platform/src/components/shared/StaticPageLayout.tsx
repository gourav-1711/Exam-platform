"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { PageTransition } from "./PageTransition";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  heading: string;
  children: React.ReactNode;
}

const FOOTER_RESOURCES = [
  { label: "Quiz",         href: "/quiz" },
  { label: "Study Notes",  href: "/study-notes" },
  { label: "PYQ",          href: "/pyq" },
  { label: "Syllabus",     href: "/syllabus" },
  { label: "NCERT Books",  href: "/ncert-books" },
];

const FOOTER_COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Contact",  href: "/contact" },
  { label: "Privacy",  href: "/privacy" },
  { label: "Terms",    href: "/terms" },
];

export function StaticPageLayout({ title, subtitle = "Explore premium educational resources", heading, children }: StaticPageLayoutProps) {
  const router = useRouter();

  return (
    <PageTransition className="min-h-screen bg-gray-50 flex flex-col">

      <div className="bg-white border-b border-border/60 px-4 py-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </button>
        <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
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

      <footer className="bg-white border-t border-border/60 px-4 pt-6 pb-24">
        <div className="max-w-2xl mx-auto">

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow">MK</div>
              <span className="font-extrabold text-base text-foreground">Manish Ki Pathshala</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
              A premium learning platform dedicated to providing the best study materials and tools for competitive exam aspirants.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <a href="https://t.me" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 transition-colors shadow-sm" aria-label="Telegram">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/></svg>
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-sm" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.76.463 3.41 1.27 4.847L2 22l5.272-1.381A9.956 9.956 0 0012.004 22C17.526 22 22 17.526 22 12.004 22 6.478 17.526 2 12.004 2zm0 18.214a8.21 8.21 0 01-4.174-1.136l-.3-.177-3.13.82.835-3.05-.195-.314A8.204 8.204 0 013.786 12c0-4.536 3.692-8.228 8.224-8.228 4.536 0 8.224 3.692 8.224 8.228-.004 4.536-3.692 8.214-8.23 8.214z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors shadow-sm" aria-label="YouTube">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Resources</p>
              <ul className="space-y-1.5">
                {FOOTER_RESOURCES.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href}>
                      <span className="text-xs text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                        {r.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Company</p>
              <ul className="space-y-1.5">
                {FOOTER_COMPANY.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href}>
                      <span className="text-xs text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                        {r.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5">
            <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">
              <Shield className="w-4 h-4" />
              ADMIN DASHBOARD
            </button>
          </div>
        </div>
      </footer>

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
