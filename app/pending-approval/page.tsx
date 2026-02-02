import { signOut, getProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PendingApprovalPage() {
    const profile = await getProfile();

    if (!profile) {
        redirect("/auth/login");
    }

    if (profile.role === 'admin') {
        redirect("/admin");
    }

    if (profile.role === 'student' && profile.is_approved) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <Card className="text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                <Clock className="w-8 h-8" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
                        <CardDescription>
                            Your account is currently under review by an administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Please check back later or contact support if you believe this is an error.
                            You will not be able to access the student dashboard until your account is approved.
                        </p>
                        <form action={signOut}>
                            <Button type="submit" variant="outline" className="w-full">
                                Sign Out
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
