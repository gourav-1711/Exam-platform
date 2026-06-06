"use client";
import React from "react";
import { MessageCircle, Send, Youtube, Instagram, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { telegram_link, youtube_link, instagram_link, x_link, whatsapp_link } from "@/lib/data";

export default function Footer() {
  const router = useRouter();

  const resources = [
    { label: "Quiz", href: "/quiz" },
    { label: "Study Notes", href: "/study-notes" },
    { label: "PYQ", href: "/pyq" },
    { label: "Syllabus", href: "/syllabus" },
    { label: "NCERT Books", href: "/ncert-books" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <div className="mt-4 bg-white border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Brand Section */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-xs">MK</span>
          </div>
          <span className="font-extrabold text-base text-foreground">
            Manish Ki Pathshala
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-[220px]">
          A premium learning platform dedicated to providing the best study
          materials and tools for competitive exam aspirants.
        </p>

        {/* Social Icons */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          {telegram_link && (
            <a
              href={telegram_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-colors"
              title="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          )}
          {whatsapp_link && (
            <a
              href={whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
              title="WhatsApp Channel"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          {youtube_link && (
            <a
              href={youtube_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {instagram_link && (
            <a
              href={instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {x_link && (
            <a
              href={x_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
              title="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-6">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              RESOURCES
            </p>
            <div className="space-y-2">
              {resources.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              COMPANY
            </p>
            <div className="space-y-2 flex flex-col">
              {companyLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          © 2026 MANISH KI PATHSHALA •{" "}
          <Link
            href="https://my-portfolio-nine-eta-bo1n0vx4mt.vercel.app/"
            className="text-violet-600 font-semibold font-sans"
          >
            DESIGNED BY ❤️ Gaurav Dadhich
          </Link>
        </p>
      </div>
    </div>
  );
}