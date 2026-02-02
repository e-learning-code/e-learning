"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface FeeSettings {
  id?: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  payment_instructions: string | null;
}

export function FeeSettingsForm({ settings }: { settings: FeeSettings | null }) {
  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState(settings?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(settings?.account_number || "");
  const [accountHolder, setAccountHolder] = useState(settings?.account_holder || "");
  const [paymentInstructions, setPaymentInstructions] = useState(
    settings?.payment_instructions || ""
  );
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const supabase = createClient();

    if (settings?.id) {
      await supabase
        .from("fee_settings")
        .update({
          bank_name: bankName || null,
          account_number: accountNumber || null,
          account_holder: accountHolder || null,
          payment_instructions: paymentInstructions || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);
    } else {
      await supabase.from("fee_settings").insert({
        bank_name: bankName || null,
        account_number: accountNumber || null,
        account_holder: accountHolder || null,
        payment_instructions: paymentInstructions || null,
      });
    }

    setLoading(false);
    setSaved(true);
    router.refresh();

    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Configure the bank details and payment instructions that students will
          see when making payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="e.g., First National Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="e.g., 1234567890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input
              id="accountHolder"
              placeholder="e.g., EduLearn Academy"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentInstructions">Payment Instructions</Label>
            <Textarea
              id="paymentInstructions"
              placeholder="Enter any additional payment instructions for students..."
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            {saved && (
              <span className="text-sm text-green-600">Settings saved!</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
