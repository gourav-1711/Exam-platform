"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCurrentAffair } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Edit } from "lucide-react";
import Link from "next/link";

export default function CurrentAffairDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: affair, isLoading, isError } = useCurrentAffair(Number(id));

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !affair) {
    return (
      <div className="p-6 md:p-8 text-center text-red-500">
        Failed to load current affair
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/current-affairs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Current Affair Details</h1>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={`/admin/current-affairs/${affair.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{affair.title}</CardTitle>
            <Badge variant="outline" className="capitalize">
              {affair.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Calendar className="h-4 w-4" />
            {new Date(affair.publishedAt).toLocaleDateString("en-US", {
              dateStyle: "full",
            })}
          </div>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-lg font-medium text-gray-700">{affair.summary}</p>
          <div className="mt-4 whitespace-pre-wrap text-gray-900">
            {affair.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}