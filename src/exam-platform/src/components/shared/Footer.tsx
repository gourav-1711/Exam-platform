"use client";
import React from "react";
import { motion, type Variants } from "framer-motion";
import { MessageCircle, Send, Youtube, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import {
  telegram_link,
  youtube_link,
  instagram_link,
  x_link,
  whatsapp_link,
} from "@/lib/data";

// ── Typed variant definitions ─────────────────────────────────────────────────
// Every object is annotated `: Variants` so TypeScript narrows `ease` and
// `type` from `string` → the specific `Easing` / "spring" | "tween" union
// that framer-motion expects. No more "not assignable to type Variants" errors.

const footerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    // "easeOut" is a valid Easing literal — annotating as Variants narrows it correctly
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const iconVariant: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 360, damping: 22 },
  },
};

// ── Social link data ──────────────────────────────────────────────────────────
const SOCIALS = [
  {
    key: "telegram",
    href: telegram_link,
    title: "Telegram",
    icon: Send,
    color: "text-sky-500",
    bg: "hover:bg-sky-50",
  },
  {
    key: "whatsapp",
    href: whatsapp_link,
    title: "WhatsApp",
    icon: MessageCircle,
    color: "text-green-500",
    bg: "hover:bg-green-50",
  },
  {
    key: "youtube",
    href: youtube_link,
    title: "YouTube",
    icon: Youtube,
    color: "text-red-500",
    bg: "hover:bg-red-50",
  },
  {
    key: "instagram",
    href: instagram_link,
    title: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bg: "hover:bg-pink-50",
  },
  {
    key: "x",
    href: x_link,
    title: "X (Twitter)",
    icon: Twitter,
    color: "text-slate-800",
    bg: "hover:bg-slate-100",
  },
];

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="mt-4 bg-white border border-border/50 shadow-sm "
    >
      <div className="p-5">
        {/* ── Brand ──────────────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex items-center gap-2.5 mb-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span className="text-white font-extrabold text-xs">MK</span>
          </motion.div>
          <span className="font-extrabold text-base text-foreground">
            Manish Ki Pathshala
          </span>
        </motion.div>

        {/* ── Description ────────────────────────────────────────────────────── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md"
        >
          A premium learning platform dedicated to providing the best study
          materials and tools for competitive exam aspirants.
        </motion.p>

        {/* ── Social Icons ───────────────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-wrap items-center gap-2.5 mb-6"
        >
          {SOCIALS.filter((s) => !!s.href).map(
            ({ key, href, title, icon: Icon, color, bg }) => (
              <motion.a
                key={key}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                variants={iconVariant}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={`w-9 h-9 rounded-xl border border-border flex items-center justify-center ${color} ${bg} transition-colors`}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ),
          )}
        </motion.div>

        {/* ── Links Grid ─────────────────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 gap-x-8 gap-y-0 mb-6"
        >
          {/* Resources */}
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              RESOURCES
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-2"
            >
              {resources.map((item) => (
                <motion.div key={item.href} variants={fadeUp}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 group"
                  >
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0"
                      whileHover={{ scale: 1.6 }}
                      transition={{ duration: 0.18 }}
                    />
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-150">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Company */}
          <motion.div variants={fadeUp}>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
              COMPANY
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col space-y-2"
            >
              {companyLinks.map((item) => (
                <motion.div key={item.href} variants={fadeUp}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Divider ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          style={{ originX: 0 }}
          className="h-px bg-border/50 mb-3"
        />

        {/* ── Copyright ──────────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-center text-[10px] text-muted-foreground"
        >
          © 2026 MANISH KI PATHSHALA •{" "}
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: "inline-block" }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <Link
              href="https://my-portfolio-nine-eta-bo1n0vx4mt.vercel.app/"
              className="text-violet-600 font-semibold font-sans"
            >
              DESIGNED BY ❤️ Gaurav Dadhich
            </Link>
          </motion.span>
        </motion.p>
      </div>
    </motion.footer>
  );
}
