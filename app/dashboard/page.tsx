import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookMarked, Video, FileQuestion, Clock, ArrowRight } from "lucide-react";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get student's accessible subjects
  const { data: accessibleSubjects } = await supabase
    .from("student_subject_access")
    .select(`
      subjects (
        id,
        name,
        description,
        videos (count),
        quizzes (count)
      )
    `)
    .eq("student_id", user?.id);

  // Get recent quiz attempts
  const { data: recentAttempts } = await supabase
    .from("quiz_attempts")
    .select(`
      *,
      quizzes (title, passing_score)
    `)
    .eq("student_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const subjects = accessibleSubjects?.map((a) => a.subjects).flat().filter(Boolean) || [];
  const totalVideos = subjects.reduce(
    (acc, s) => acc + (s?.videos?.[0]?.count || 0),
    0
  );
  const totalQuizzes = subjects.reduce(
    (acc, s) => acc + (s?.quizzes?.[0]?.count || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Subjects</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {subjects.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <BookMarked className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Videos Available</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {totalVideos}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/20">
                <Video className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Available</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {totalQuizzes}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/20">
                <FileQuestion className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Subjects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/subjects">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have access to any subjects yet.
                </p>
                <Button asChild>
                  <Link href="/dashboard/payments">Subscribe to a Subject</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 4).map((subject) => (
                  <Link
                    key={subject?.id}
                    href={`/dashboard/subjects/${subject?.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {subject?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subject?.videos?.[0]?.count || 0} videos,{" "}
                        {subject?.quizzes?.[0]?.count || 0} quizzes
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quiz Attempts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Quiz Results</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/quizzes">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentAttempts || recentAttempts.length === 0 ? (
              <div className="text-center py-8">
                <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  You haven&apos;t taken any quizzes yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => {
                  const passed =
                    attempt.score >= (attempt.quizzes?.passing_score || 70);
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {attempt.quizzes?.title || "Quiz"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(attempt.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${passed ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {attempt.score}%
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
