"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Pencil, Trash2, Video, FileQuestion } from "lucide-react";
import { EditSubjectDialog } from "./edit-subject-dialog";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  fee: number;
  is_active: boolean;
  created_at: string;
  videos: { count: number }[];
  quizzes: { count: number }[];
}

export function SubjectsTable({ subjects }: { subjects: Subject[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("subjects").delete().eq("id", deleteId);

    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  if (subjects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No subjects yet. Create your first subject to get started.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead>Quizzes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {subject.description || "-"}
                </TableCell>
                <TableCell>${subject.fee}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    {subject.videos?.[0]?.count || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4 text-muted-foreground" />
                    {subject.quizzes?.[0]?.count || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      subject.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {subject.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditSubject(subject)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(subject.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subject? This will also delete
              all associated videos and quizzes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editSubject && (
        <EditSubjectDialog
          subject={editSubject}
          open={!!editSubject}
          onOpenChange={(open) => !open && setEditSubject(null)}
        />
      )}
    </>
  );
}
