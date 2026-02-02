"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Payment {
  id: string;
  student_id: string;
  subject_id: string;
  amount: number;
  receipt_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
  subjects: { name: string } | null;
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function updatePaymentStatus(
    paymentId: string,
    studentId: string,
    subjectId: string,
    status: "approved" | "rejected"
  ) {
    setLoadingId(paymentId);
    const supabase = createClient();

    // Get current admin user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Unable to get admin user:", userError);
      setLoadingId(null);
      return;
    }

    // Update payment status correctly
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status,
        reviewed_at: new Date().toISOString(), // correct column
        reviewed_by: user.id,                  // track admin
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      setLoadingId(null);
      return;
    }

    // If approved, grant subject access and approve student account
    if (status === "approved") {
      const { error: accessError } = await supabase
        .from("student_subject_access")
        .upsert(
          {
            student_id: studentId,
            subject_id: subjectId,
          },
          { onConflict: "student_id,subject_id" }
        );

      if (accessError) {
        console.error("Error granting subject access:", accessError);
      }

      // Also mark student as approved so they can access the dashboard
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", studentId);

      if (profileError) {
        console.error("Error approving student profile:", profileError);
      }
    }

    setLoadingId(null);
    router.refresh();
  }

  if (payments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No payment submissions yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {payment.profiles?.full_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.profiles?.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {payment.subjects?.name || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">${payment.amount}</TableCell>
              <TableCell>
                {payment.receipt_url ? (
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">No receipt</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${payment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {payment.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(payment.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {payment.status === "pending" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === payment.id}
                      >
                        {loadingId === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          updatePaymentStatus(
                            payment.id,
                            payment.student_id,
                            payment.subject_id,
                            "approved"
                          )
                        }
                        className="text-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updatePaymentStatus(
                            payment.id,
                            payment.student_id,
                            payment.subject_id,
                            "rejected"
                          )
                        }
                        className="text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
