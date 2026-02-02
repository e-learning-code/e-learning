import { createClient } from "@/lib/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuestionsManager } from "@/components/questions-manager";
import { ArrowLeft } from "lucide-react";

export default async function QuizQuestionsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`
      *,
      subjects:subject_id (name)
    `)
    .eq("id", quizId)
    .single();

  if (!quiz) {
    notFound();
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quizzes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground mt-1">
            {quiz.subjects?.name} - Manage quiz questions
          </p>
        </div>
      </div>

      <QuestionsManager quizId={quizId} questions={questions || []} />
    </div>
  );
}
