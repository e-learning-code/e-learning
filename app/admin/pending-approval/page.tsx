import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PendingApprovalPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your account is currently under review. Please wait for approval from an administrator.</p>
        </CardContent>
      </Card>
    </div>
  )
}