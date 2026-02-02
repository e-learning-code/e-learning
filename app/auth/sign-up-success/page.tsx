import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Mail } from "lucide-react";

export default function SignUpSuccessPage() {
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
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link to verify your email
              address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to activate your account and start
              learning. If you don&apos;t see the email, check your spam folder.
            </p>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
