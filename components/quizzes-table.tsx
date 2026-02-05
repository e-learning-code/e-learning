"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, ListPlus, Clock } from "lucide-react";
import { EditQuizDialog } from "./edit-quiz-dialog";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject_id: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  subjects: { title: string } | null;
  quiz_questions: { count: number }[];
}

interface Subject {
  id: string;
  title: string;
}

export function QuizzesTable({
  quizzes,
  subjects,
}: {
  quizzes: Quiz[];
  subjects: Subject[];
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("quizzes").delete().eq("id", deleteId);

    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  if (quizzes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No quizzes yet. Create your first quiz to get started.
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
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Pass Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {quiz.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {quiz.subjects?.title || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>{quiz.quiz_questions?.[0]?.count || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {quiz.time_limit_minutes} min
                  </div>
                </TableCell>
                <TableCell>{quiz.passing_score}%</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      quiz.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {quiz.is_active ? "Active" : "Inactive"}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/quizzes/${quiz.id}/questions`}>
                          <ListPlus className="w-4 h-4 mr-2" />
                          Manage Questions
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditQuiz(quiz)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(quiz.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? All questions and
              student attempts will also be deleted. This action cannot be
              undone.
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

      {editQuiz && (
        <EditQuizDialog
          quiz={editQuiz}
          subjects={subjects}
          open={!!editQuiz}
          onOpenChange={(open) => !open && setEditQuiz(null)}
        />
      )}
    </>
  );
}
