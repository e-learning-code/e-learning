import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">EduLearn</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during the authentication process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The link may have expired or already been used. Please try signing
              in again or create a new account.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
