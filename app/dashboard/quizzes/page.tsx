import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileQuestion, Clock, Play, CheckCircle, XCircle } from "lucide-react";

export default async function StudentQuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get student's accessible subjects
  const { data: accessibleSubjects } = await supabase
    .from("student_subject_access")
    .select("subject_id")
    .eq("student_id", user?.id);

  const subjectIds = accessibleSubjects?.map((a) => a.subject_id) || [];

  // Get quizzes for accessible subjects
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      subjects:subject_id (name),
      quiz_questions (count)
    `)
    .in("subject_id", subjectIds.length > 0 ? subjectIds : ["none"])
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Get all quiz attempts for this student
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("student_id", user?.id)
    .order("created_at", { ascending: false });

  // Group attempts by quiz
  const attemptsByQuiz = (attempts || []).reduce((acc, attempt) => {
    if (!acc[attempt.quiz_id]) {
      acc[attempt.quiz_id] = [];
    }
    acc[attempt.quiz_id].push(attempt);
    return acc;
  }, {} as Record<string, typeof attempts>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground mt-1">
          Test your knowledge and track your progress.
        </p>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Quizzes Available
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to subjects to access their quizzes.
          </p>
          <Button asChild>
            <Link href="/dashboard/payments">Browse Subjects</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const quizAttempts = attemptsByQuiz[quiz.id] || [];
            const bestScore = quizAttempts.length > 0
              ? Math.max(...quizAttempts.map((a: any) => a.score))
              : null;
            const passed = bestScore !== null && bestScore >= quiz.passing_score;

            return (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    {bestScore !== null && (
                      <div
                        className={`p-1.5 rounded-full ${
                          passed ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {quiz.subjects?.name || "Unknown Subject"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <FileQuestion className="w-4 h-4" />
                      {quiz.quiz_questions?.[0]?.count || 0} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.time_limit_minutes} min
                    </div>
                  </div>

                  {bestScore !== null && (
                    <div className="p-3 rounded-lg bg-muted mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Best Score:</span>
                        <span
                          className={`font-bold ${
                            passed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {bestScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="text-foreground">
                          {quizAttempts.length}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/quizzes/${quiz.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        {bestScore !== null ? "Retake Quiz" : "Start Quiz"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
