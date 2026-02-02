import { createClient } from "@/lib/server";
import { StudentsTable } from "@/components/students-table";

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select(`
      *,
      student_subject_access (
        subject_id,
        subjects (name)
      )
    `)
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">
          Manage student accounts and subject access.
        </p>
      </div>

      <StudentsTable students={students || []} subjects={subjects || []} />
    </div>
  );
}
