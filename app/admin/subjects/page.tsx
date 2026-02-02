import { createClient } from "@/lib/server";
import { SubjectsTable } from "@/components/subjects-table";
import { AddSubjectDialog } from "@/components/add-subject-dialog";

export default async function SubjectsPage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      *,
      videos:videos(count),
      quizzes:quizzes(count)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your course subjects and content.
          </p>
        </div>
        <AddSubjectDialog />
      </div>

      <SubjectsTable subjects={subjects || []} />
    </div>
  );
}
