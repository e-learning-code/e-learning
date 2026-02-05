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
  monthly_fee: number;
  currency: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  additional_info: string | null;
}

export function FeeSettingsForm({ settings }: { settings: FeeSettings | null }) {
  const [loading, setLoading] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState(settings?.monthly_fee?.toString() || "");
  const [currency, setCurrency] = useState(settings?.currency || "USD");
  const [bankName, setBankName] = useState(settings?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(settings?.account_number || "");
  const [accountName, setAccountName] = useState(settings?.account_name || "");
  const [additionalInfo, setAdditionalInfo] = useState(
    settings?.additional_info || ""
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    try {
      const supabase = createClient();
      let result;

      if (settings?.id) {
        result = await supabase
          .from("fee_settings")
          .update({
            monthly_fee: parseFloat(monthlyFee) || 0,
            currency: currency || "USD",
            bank_name: bankName || null,
            account_number: accountNumber || null,
            account_name: accountName || null,
            additional_info: additionalInfo || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id);
      } else {
        result = await supabase.from("fee_settings").insert({
          monthly_fee: parseFloat(monthlyFee) || 0,
          currency: currency || "USD",
          bank_name: bankName || null,
          account_number: accountNumber || null,
          account_name: accountName || null,
          additional_info: additionalInfo || null,
        });
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setLoading(false);
      setSaved(true);
      router.refresh();

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to save settings");
      console.error("Error saving settings:", err);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Configure the monthly fee, bank details, and payment instructions that students will
          see when making payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Monthly Fee *</Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                placeholder="e.g., 100.00"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="e.g., USD"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
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
            <Label htmlFor="accountName">Account Holder Name</Label>
            <Input
              id="accountName"
              placeholder="e.g., EduLearn Academy"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Payment Instructions</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Enter any additional payment instructions for students..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
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
            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
