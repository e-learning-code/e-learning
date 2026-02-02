import { createClient } from "@/lib/server";
import { AdminMessagesView } from "@/components/admin-messages-view";

export default async function MessagesPage() {
  const supabase = await createClient();

  // Get unique conversations (grouped by student)
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id (id, full_name, email),
      receiver:receiver_id (id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Get all students who have sent messages
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with students and answer their questions.
        </p>
      </div>

      <AdminMessagesView messages={messages || []} students={students || []} />
    </div>
  );
}
