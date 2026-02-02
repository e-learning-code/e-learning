import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Redirect based on role
      if (user?.user_metadata?.role === "admin") {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to auth error page if something goes wrong
  return NextResponse.redirect(`${origin}/auth/error`);
}
