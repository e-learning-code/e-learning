import { createClient } from "@/lib/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";
import { ArrowLeft, Video, FileQuestion, Play, Clock } from "lucide-react";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if student has access
  const { data: access } = await supabase
    .from("student_subject_access")
    .select("*")
    .eq("student_id", user?.id)
    .eq("subject_id", subjectId)
    .single();

  if (!access) {
    redirect("/dashboard/subjects");
  }

  // Get subject details
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (!subject) {
    notFound();
  }

  // Get videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("order_index");

  // Get quizzes
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questions (count)
    `)
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("created_at");

  // Get quiz attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score")
    .eq("student_id", user?.id);

  const attemptsByQuiz = attempts?.reduce((acc, a) => {
    if (!acc[a.quiz_id] || a.score > acc[a.quiz_id]) {
      acc[a.quiz_id] = a.score;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/subjects">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{subject.title}</h1>
          {subject.description && (
            <p className="text-muted-foreground mt-1">{subject.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos ({videos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            Quizzes ({quizzes?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          {!videos || videos.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No videos available for this subject yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <VideoPlayer key={video.id} video={video} index={index + 1} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {!quizzes || quizzes.length === 0 ? (
            <Card className="p-8 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No quizzes available for this subject yet.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => {
                const bestScore = attemptsByQuiz[quiz.id];
                const passed = bestScore !== undefined && bestScore >= quiz.passing_score;

                return (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileQuestion className="w-4 h-4" />
                          {quiz.quiz_questions?.[0]?.count || 0} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {quiz.time_limit_minutes} min
                        </div>
                      </div>
                      {bestScore !== undefined && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                          <span className="text-sm text-muted-foreground">
                            Best Score:
                          </span>
                          <span
                            className={`font-bold ${
                              passed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {bestScore}%
                          </span>
                        </div>
                      )}
                      <Button className="w-full" asChild>
                        <Link href={`/dashboard/quizzes/${quiz.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          {bestScore !== undefined ? "Retake Quiz" : "Start Quiz"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
