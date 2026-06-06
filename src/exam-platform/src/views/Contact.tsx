"use client";

import React, { useState } from "react";
import { StaticPageLayout, SectionHeading } from "@/components/shared/StaticPageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, MapPin, CheckCircle2 } from "lucide-react";
import { contact_gmail, contact_number, contact_address, telegram_link, whatsapp_link } from "@/lib/data";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName(""); setEmail(""); setMessage("");
    setTimeout(() => setSent(false), 5000);
  };

  const contactNumberFormatted = contact_number 
    ? `+91 ${contact_number.slice(0, 5)} ${contact_number.slice(5)}`
    : "";

  return (
    <StaticPageLayout title="Contact Us" heading="Contact Us">

      {/* Contact Info Cards */}
      <div className="space-y-3">
        {[
          {
            icon: Mail,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            title: "Email Support",
            sub: "Usually replies within 2 hours",
            value: contact_gmail,
            href: `mailto:${contact_gmail}`,
            valueColor: "text-primary",
          },
          {
            icon: MessageCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            title: "WhatsApp & Telegram",
            sub: "Join our official channels or chat with us",
            value: contactNumberFormatted || "Chat with us",
            href: whatsapp_link || `https://wa.me/91${contact_number}`,
            valueColor: "text-green-600",
          },
          {
            icon: MapPin,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            title: "Location",
            sub: contact_address || "Rajasthan, India",
            value: "Jaipur, Rajasthan — 302001",
            href: null,
            valueColor: "text-foreground",
          },
        ].map(({ icon: Icon, iconBg, iconColor, title, sub, value, href, valueColor }) => (
          <div key={title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-border/50">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
              {href ? (
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  className={`text-xs font-semibold mt-0.5 hover:underline block ${valueColor}`}>{value}</a>
              ) : (
                <p className={`text-xs font-semibold mt-0.5 ${valueColor}`}>{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="pt-1">
        <SectionHeading>Send a Message</SectionHeading>

        {sent && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2 text-sm font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4" /> Message sent! We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="h-10 rounded-xl text-sm bg-gray-50 border-gray-200" required />
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="h-10 rounded-xl text-sm bg-gray-50 border-gray-200" required />
          </div>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message here..."
            className="min-h-[100px] rounded-xl text-sm bg-gray-50 border-gray-200 resize-none"
            required
          />
          <Button type="submit" className="w-full h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm">
            Send Message
          </Button>
        </form>
      </div>

    </StaticPageLayout>
  );
}