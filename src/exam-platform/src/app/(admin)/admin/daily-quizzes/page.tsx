import DailyQuizzesAdmin from "@/components/admin/DailyQuizzesAdmin";

export const metadata = { title: "Admin — Daily Quizzes" };

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daily Quizzes — Admin</h1>
      <DailyQuizzesAdmin />
    </div>
  );
}
