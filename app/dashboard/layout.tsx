import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { StudentSidebar } from "@/components/student-sidebar";
import { MobileNav } from "@/components/mobile-nav";

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
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-[margin] duration-300">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur md:hidden">
          <MobileNav profile={profile} />
          <div className="ml-4 font-bold text-lg">EduLearn</div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
