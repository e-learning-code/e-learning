import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Users, Video, FileQuestion, DollarSign, MessageSquare } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts for dashboard stats
  const [
    { count: subjectsCount },
    { count: studentsCount },
    { count: videosCount },
    { count: quizzesCount },
    { count: pendingPaymentsCount },
    { count: unreadMessagesCount },
  ] = await Promise.all([
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
  ]);

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles:student_id (full_name, email),
      subjects:subject_id (name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent messages
  const { data: recentMessages } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:sender_id (full_name, email)
    `)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Subjects", value: subjectsCount || 0, icon: BookMarked, color: "text-primary" },
    { label: "Total Students", value: studentsCount || 0, icon: Users, color: "text-accent-foreground" },
    { label: "Total Videos", value: videosCount || 0, icon: Video, color: "text-chart-3" },
    { label: "Total Quizzes", value: quizzesCount || 0, icon: FileQuestion, color: "text-chart-4" },
    { label: "Pending Payments", value: pendingPaymentsCount || 0, icon: DollarSign, color: "text-chart-5" },
    { label: "Unread Messages", value: unreadMessagesCount || 0, icon: MessageSquare, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={cn("p-3 rounded-lg bg-muted", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.subjects?.name || "Unknown Subject"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ${payment.amount}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          payment.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent payments</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages && recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">
                        {message.profiles?.full_name || "Unknown"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No unread messages</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
