"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  FileQuestion,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subjects", label: "My Subjects", icon: BookMarked },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function StudentSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || "?";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">EduLearn</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {profile?.full_name || "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
