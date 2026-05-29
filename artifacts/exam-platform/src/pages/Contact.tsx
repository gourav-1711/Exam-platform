import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <PageTransition className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 py-8 mb-4">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card rounded-3xl shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email Support</h3>
                <p className="text-muted-foreground mb-2">Usually replies within 2 hours</p>
                <a href="mailto:support@manishkipathshala.com" className="text-primary font-medium hover:underline">
                  support@manishkipathshala.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card rounded-3xl shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">WhatsApp</h3>
                <p className="text-muted-foreground mb-2">Available 9 AM - 6 PM</p>
                <a href="#" className="text-emerald-600 font-medium hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card rounded-3xl shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Office</h3>
                <p className="text-muted-foreground leading-relaxed">
                  123 Education Hub, Knowledge City<br />
                  New Delhi, 110001<br />
                  India
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-3 border-border/50 bg-card rounded-3xl shadow-sm h-full">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" className="rounded-xl h-12 bg-muted/50 border-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" className="rounded-xl h-12 bg-muted/50 border-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="john@example.com" className="rounded-xl h-12 bg-muted/50 border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="How can we help you?" className="min-h-[150px] rounded-xl bg-muted/50 border-transparent resize-none" />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-xl h-14 bg-foreground text-background hover:bg-foreground/90 text-lg shadow-xl mt-4">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
