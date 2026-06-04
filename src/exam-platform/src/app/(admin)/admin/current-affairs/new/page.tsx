"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCurrentAffair } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["General", "National", "International", "Economy", "Science & Tech"];

export default function NewCurrentAffairPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [form, setForm] = useState({
        title: "",
        summary: "",
        content: "",
        category: "General",
    });

    const createMutation = useCreateCurrentAffair();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.summary || !form.content) {
            toast({ title: "All fields are required", variant: "destructive" });
            return;
        }
        try {
            await createMutation.mutateAsync({
                ...form,
                publishedAt: new Date().toISOString(),
            });
            toast({ title: "Current affair created successfully" });
            router.push("/admin/current-affairs");
        } catch {
            toast({ title: "Failed to create current affair", variant: "destructive" });
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/current-affairs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">New Current Affair</h1>
                    <p className="text-gray-500 text-sm">Create a new current affairs article</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Article Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary *</Label>
                            <Textarea
                                id="summary"
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                rows={6}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/admin/current-affairs">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="bg-violet-600 hover:bg-violet-700"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {createMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}