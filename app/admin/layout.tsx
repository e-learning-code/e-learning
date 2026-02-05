import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminMobileNav } from "@/components/admin-mobile-nav";

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
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-[margin] duration-300">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur md:hidden">
          <AdminMobileNav />
          <div className="ml-4 font-bold text-lg">EduLearn Admin</div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
