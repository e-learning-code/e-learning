import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentSubmitForm } from "@/components/payment-submit-form";
import { CreditCard, CheckCircle, Clock, XCircle, BookMarked } from "lucide-react";

export default async function StudentPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all available subjects
  const { data: allSubjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // Get student's current access
  const { data: accessibleSubjects } = await supabase
    .from("student_subject_access")
    .select("subject_id")
    .eq("student_id", user?.id);

  const accessibleIds = accessibleSubjects?.map((a) => a.subject_id) || [];

  // Get student's payment history
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      subjects:subject_id (name)
    `)
    .eq("student_id", user?.id)
    .order("created_at", { ascending: false });

  // Get fee settings
  const { data: feeSettings } = await supabase
    .from("fee_settings")
    .select("*")
    .single();

  // Subjects the student doesn't have access to
  const availableSubjects =
    allSubjects?.filter((s) => !accessibleIds.includes(s.id)) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Subscribe to subjects and view your payment history.
        </p>
      </div>

      <Tabs defaultValue="subscribe" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscribe" className="flex items-center gap-2">
            <BookMarked className="w-4 h-4" />
            Subscribe
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribe" className="space-y-6">
          {/* Payment Instructions */}
          {feeSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Instructions</CardTitle>
                <CardDescription>
                  Follow these instructions to complete your payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {feeSettings.bank_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium text-foreground">
                        {feeSettings.bank_name}
                      </p>
                    </div>
                  )}
                  {feeSettings.account_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Number
                      </p>
                      <p className="font-medium text-foreground">
                        {feeSettings.account_number}
                      </p>
                    </div>
                  )}
                  {feeSettings.account_holder && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Holder
                      </p>
                      <p className="font-medium text-foreground">
                        {feeSettings.account_holder}
                      </p>
                    </div>
                  )}
                </div>
                {feeSettings.payment_instructions && (
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {feeSettings.payment_instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Available Subjects */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Available Subjects
            </h2>
            {availableSubjects.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-foreground font-medium">
                  You have access to all available subjects!
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {availableSubjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      {subject.description && (
                        <CardDescription className="line-clamp-2">
                          {subject.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="text-2xl font-bold text-foreground">
                          ${subject.fee}
                        </span>
                      </div>
                      <PaymentSubmitForm
                        subjectId={subject.id}
                        subjectName={subject.name}
                        amount={subject.fee}
                        studentId={user?.id || ""}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          {!payments || payments.length === 0 ? (
            <Card className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No payment history yet.</p>
            </Card>
          ) : (
            <Card>
              <div className="divide-y divide-border">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.subjects?.name || "Unknown Subject"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-bold text-foreground">
                        ${payment.amount}
                      </span>
                      <Badge
                        variant={
                          payment.status === "approved"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="flex items-center gap-1"
                      >
                        {payment.status === "approved" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {payment.status === "pending" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {payment.status === "rejected" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
