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
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

interface Subject {
  id: string;
  name: string;
}

export function GrantAccessDialog({
  student,
  subjects,
  existingAccess,
  open,
  onOpenChange,
}: {
  student: Student;
  subjects: Subject[];
  existingAccess: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(existingAccess);
  const router = useRouter();

  function toggleSubject(subjectId: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Remove access for deselected subjects
    const toRemove = existingAccess.filter(
      (id) => !selectedSubjects.includes(id)
    );
    if (toRemove.length > 0) {
      await supabase
        .from("student_subject_access")
        .delete()
        .eq("student_id", student.id)
        .in("subject_id", toRemove);
    }

    // Add access for newly selected subjects
    const toAdd = selectedSubjects.filter(
      (id) => !existingAccess.includes(id)
    );
    if (toAdd.length > 0) {
      await supabase.from("student_subject_access").insert(
        toAdd.map((subject_id) => ({
          student_id: student.id,
          subject_id,
        }))
      );
    }

    setLoading(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Subject Access</DialogTitle>
          <DialogDescription>
            Select subjects for {student.full_name || student.email} to access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {subjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No subjects available. Create subjects first.
              </p>
            ) : (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={subject.id}
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                  <Label
                    htmlFor={subject.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {subject.name}
                  </Label>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || subjects.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
