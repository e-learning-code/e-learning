import { createClient } from "@/lib/server";
import { notFound, redirect } from "next/navigation";
import { QuizTaker } from "@/components/quiz-taker";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get quiz details
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`
      *,
      subjects:subject_id (id, name)
    `)
    .eq("id", quizId)
    .eq("is_active", true)
    .single();

  if (!quiz) {
    notFound();
  }

  // Check if student has access to this subject
  const { data: access } = await supabase
    .from("student_subject_access")
    .select("*")
    .eq("student_id", user?.id)
    .eq("subject_id", quiz.subject_id)
    .single();

  if (!access) {
    redirect("/dashboard/quizzes");
  }

  // Get previous attempts to determine current attempt number
  const { data: previousAttempts } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("quiz_id", quizId)
    .eq("student_id", user?.id);

  const currentAttemptNumber = (previousAttempts?.length || 0) + 1;

  // Get questions
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order");

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No Questions Available
        </h1>
        <p className="text-muted-foreground">
          This quiz doesn&apos;t have any questions yet. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <QuizTaker
      quiz={quiz}
      questions={questions}
      studentId={user?.id || ""}
      currentAttemptNumber={currentAttemptNumber}
    />
  );
}
