import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { StudentSidebar } from "@/components/student-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect admins to admin dashboard
  if (user.user_metadata?.role === "admin") {
    redirect("/admin");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
