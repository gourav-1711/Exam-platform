import type { Metadata } from "next";
import { quizMetadata } from "@/lib/seo";
import QuizListing from "@/views/QuizListing";

export const metadata: Metadata = quizMetadata;

export default function QuizListingPage() {
  return <QuizListing />;
}
