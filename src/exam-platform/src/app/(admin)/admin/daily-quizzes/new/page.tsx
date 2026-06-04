"use client";

import DailyQuizForm from "@/components/admin/DailyQuizForm";

export default function NewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Daily Quiz</h1>
      <DailyQuizForm mode="create" />
    </div>
  );
}
