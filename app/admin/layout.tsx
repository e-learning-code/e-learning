import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
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

  // Check if user is admin
  if (user.user_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
