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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, BookPlus, Ban, CheckCircle } from "lucide-react";
import { GrantAccessDialog } from "./grant-access-dialog";

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  student_subject_access: {
    subject_id: string;
    subjects: { name: string } | null;
  }[];
}

interface Subject {
  id: string;
  name: string;
}

export function StudentsTable({
  students,
  subjects,
}: {
  students: Student[];
  subjects: Subject[];
}) {
  const [grantAccessStudent, setGrantAccessStudent] = useState<Student | null>(null);
  const router = useRouter();

  async function toggleStudentStatus(studentId: string, currentStatus: boolean) {
    const supabase = createClient();
    const updates: any = { is_active: !currentStatus };
    if (!currentStatus) {
      updates.is_approved = true;
    }

    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", studentId);
    router.refresh();
  }

  if (students.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No students registered yet.
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.full_name || "No name"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {student.phone || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {student.student_subject_access?.length > 0 ? (
                      student.student_subject_access.slice(0, 3).map((access, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {access.subjects?.name || "Unknown"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                    {student.student_subject_access?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{student.student_subject_access.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${!student.is_approved
                      ? "bg-yellow-100 text-yellow-700"
                      : student.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {!student.is_approved
                      ? "Pending"
                      : student.is_active
                        ? "Active"
                        : "Blocked"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(student.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setGrantAccessStudent(student)}
                      >
                        <BookPlus className="w-4 h-4 mr-2" />
                        Grant Subject Access
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toggleStudentStatus(student.id, student.is_active)
                        }
                      >
                        {!student.is_approved ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Student
                          </>
                        ) : student.is_active ? (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Block Student
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Unblock Student
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {grantAccessStudent && (
        <GrantAccessDialog
          student={grantAccessStudent}
          subjects={subjects}
          existingAccess={grantAccessStudent.student_subject_access.map(
            (a) => a.subject_id
          )}
          open={!!grantAccessStudent}
          onOpenChange={(open) => !open && setGrantAccessStudent(null)}
        />
      )}
    </>
  );
}
