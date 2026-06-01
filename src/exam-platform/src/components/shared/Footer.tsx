import { MessageCircle, Send, Youtube } from "lucide-react";
import React from "react";

export default function Footer() {
  return (
    <div className="mx-4 mt-4 bg-white border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-xs">MK</span>
          </div>
          <span className="font-extrabold text-base text-foreground">
            Manish Ki Pathshala
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-[220px]">
          A premium learning platform dedicated to providing the best study
          materials and tools for competitive exam aspirants.
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-2.5 mb-6">
          <a
            href="#"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          >
            <Youtube className="w-4 h-4" />
          </a>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-6">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              RESOURCES
            </p>
            <div className="space-y-2">
              {[
                "Quiz",
                "Study Notes",
                "P Y Q",
                "Syllabus",
                "N C E R Books",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              COMPANY
            </p>
            <div className="space-y-2">
              {["About Us", "Contact", "Privacy", "Terms"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          © 2026 MANISH KI PATHSHALA •{" "}
          <span className="text-violet-600 font-semibold">
            DESIGNED BY ❤️ Gaurav Dadhich
          </span>
        </p>
      </div>
    </div>
  );
}
