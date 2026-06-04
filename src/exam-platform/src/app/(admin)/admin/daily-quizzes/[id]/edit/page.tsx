"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DailyQuizForm from "@/components/admin/DailyQuizForm";

export default function EditPage() {
  const params = useParams();
  const id = params?.id;
  const [initial, setInitial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/daily-quiz/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setInitial(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!initial) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Daily Quiz</h1>
      <DailyQuizForm mode="edit" id={id} initial={initial} />
    </div>
  );
}
