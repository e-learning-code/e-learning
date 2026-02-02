"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const supabase = createClient();

    await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile?.id);

    setLoading(false);
    setSaved(true);
    router.refresh();

    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                  Save Changes
                </>
              )}
            </Button>
            {saved && (
              <span className="text-sm text-green-600">Profile updated!</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
