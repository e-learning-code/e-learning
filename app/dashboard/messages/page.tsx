import { createClient } from "@/lib/server";
import { StudentMessagesView } from "@/components/student-messages-view";

export default async function StudentMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get messages for this student
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name, email, role),
      receiver:receiver_id (id, full_name, email, role)
    `)
    .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
    .order("created_at", { ascending: true });

  // Get admin users for sending messages
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "admin");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Contact administrators for support and questions.
        </p>
      </div>

      <StudentMessagesView
        messages={messages || []}
        admins={admins || []}
        studentId={user?.id || ""}
      />
    </div>
  );
}
