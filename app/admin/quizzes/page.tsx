import { createClient } from "@/lib/server";
import { QuizzesTable } from "@/components/quizzes-table";
import { AddQuizDialog } from "@/components/add-quiz-dialog";

export default async function QuizzesPage() {
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      subjects:subject_id (name),
      quiz_questions (count)
    `)
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage quizzes for your subjects.
          </p>
        </div>
        <AddQuizDialog subjects={subjects || []} />
      </div>

      <QuizzesTable quizzes={quizzes || []} subjects={subjects || []} />
    </div>
  );
}
