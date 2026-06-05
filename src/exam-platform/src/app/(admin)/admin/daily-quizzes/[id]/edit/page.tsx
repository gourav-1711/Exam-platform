import DailyQuizForm from '@/components/admin/DailyQuizForm';
import { getDailyQuizById } from '@workspace/api-client-react';

export default async function EditDailyQuizPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch the quiz data
  const initial = await getDailyQuizById(id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Daily Quiz</h1>
      <DailyQuizForm mode="edit" id={id} initial={initial} />
    </div>
  );
}