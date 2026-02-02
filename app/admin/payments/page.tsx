import { createClient } from "@/lib/server";
import { PaymentsTable } from "@/components/payments-table";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles:student_id (full_name, email),
      subjects:subject_id (name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve student payment submissions.
        </p>
      </div>

      <PaymentsTable payments={payments || []} />
    </div>
  );
}
