import { createClient } from "@/lib/server";
import { QuizResultsManager } from "@/components/quiz-results-manager";

export default async function QuizResultsPage() {
  const supabase = await createClient();

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select(`
      *,
      quizzes:quiz_id (id, title, subjects:subject_id (name)),
      students:student_id (id, email, full_name)
    `)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quiz Results</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze student quiz performance and results
        </p>
      </div>

      <QuizResultsManager attempts={attempts || []} />
    </div>
  );
}
