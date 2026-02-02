"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, Upload, CheckCircle } from "lucide-react";

export function PaymentSubmitForm({
  subjectId,       // ✅ Added
  subjectName,
  amount,
  studentId,
}: {
  subjectId: string;   // ✅ Added
  subjectName: string;
  amount: number;
  studentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptFile) return;

    setLoading(true);
    const supabase = createClient();

    /* ---------- Upload receipt ---------- */
    const fileExt = receiptFile.name.split(".").pop();
    const fileName = `${studentId}/${subjectId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, receiptFile, { upsert: true });

    if (uploadError) {
      console.error("Receipt upload error:", uploadError);
      setLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("receipts").getPublicUrl(fileName);

    const now = new Date();

    /* ---------- Insert payment ---------- */
    const { error } = await supabase.from("payments").insert({
      student_id: studentId,
      subject_id: subjectId,   // ✅ Important!
      amount: Number(amount),
      payment_month: now.toLocaleString("default", { month: "long" }),
      payment_year: now.getFullYear(),
      receipt_url: publicUrl,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      console.error("Payment insert error:", error);
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setReceiptFile(null);
      router.refresh();
    }, 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CreditCard className="w-4 h-4 mr-2" />
          Submit Payment
        </Button>
      </DialogTrigger>

      <DialogContent>
        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Payment Submitted!
            </h2>
            <p className="text-muted-foreground">
              Your payment is pending admin approval.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Submit Payment</DialogTitle>
              <DialogDescription>
                Submit your payment for {subjectName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex justify-between">
                  <span>Subject:</span>
                  <span className="font-medium">{subjectName}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Amount:</span>
                  <span className="text-xl font-bold">${amount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Receipt *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setReceiptFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="receipt"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    {receiptFile ? (
                      <div className="flex justify-center gap-2">
                        <CheckCircle className="text-green-600" />
                        {receiptFile.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload />
                        <span className="text-sm text-muted-foreground">
                          Click to upload receipt (PNG, JPG, PDF)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !receiptFile}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
