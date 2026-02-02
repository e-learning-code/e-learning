import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookMarked, Video, FileQuestion, ArrowRight } from "lucide-react";

export default async function StudentSubjectsPage() {
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

  const subjects = accessibleSubjects?.map((a) => a.subjects).filter(Boolean) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Subjects</h1>
        <p className="text-muted-foreground mt-1">
          Access your subscribed subjects and learning materials.
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookMarked className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Subjects Yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven&apos;t subscribed to any subjects yet. Browse available
            subjects and make a payment to get started.
          </p>
          <Button asChild>
            <Link href="/dashboard/payments">Browse Subjects</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject?.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookMarked className="w-5 h-5 text-primary" />
                  </div>
                  {subject?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subject?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subject.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    {subject?.videos?.[0]?.count || 0} videos
                  </div>
                  <div className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    {subject?.quizzes?.[0]?.count || 0} quizzes
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/subjects/${subject?.id}`}>
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
