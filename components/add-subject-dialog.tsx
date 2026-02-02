"use client";

import React from "react"

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";

export function AddSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("");
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

 const { error } = await supabase.from("subjects").insert({
  title: name, // 👈 change is HERE
  description: description || null,
  fee: parseFloat(fee) || 0,
  is_active: isActive,
});


    setLoading(false);

    if (!error) {
      setOpen(false);
      setName("");
      setDescription("");
      setFee("");
      setIsActive(true);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject for your students to access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the subject..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Fee ($)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subjectw"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
