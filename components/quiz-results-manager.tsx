"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  User,
  BookOpen,
  CheckCircle,
  XCircle
} from "lucide-react";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  passed: boolean;
  answers: Record<string, number>;
  time_taken_seconds: number;
  status: string;
  submitted_at: string;
  started_at: string;
  quizzes: {
    id: string;
    title: string;
    subjects: { name: string } | null;
  };
  students: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export function QuizResultsManager({
  attempts,
}: {
  attempts: QuizAttempt[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  // Get unique quizzes and students for filters
  const uniqueQuizzes = useMemo(() => {
    const quizzes = new Map();
    attempts.forEach(attempt => {
      if (!quizzes.has(attempt.quiz_id)) {
        quizzes.set(attempt.quiz_id, attempt.quizzes);
      }
    });
    return Array.from(quizzes.values());
  }, [attempts]);

  const uniqueStudents = useMemo(() => {
    const students = new Map();
    attempts.forEach(attempt => {
      if (!students.has(attempt.student_id)) {
        students.set(attempt.student_id, attempt.students);
      }
    });
    return Array.from(students.values());
  }, [attempts]);

  // Filter attempts based on search and filters
  const filteredAttempts = useMemo(() => {
    return attempts.filter(attempt => {
      const matchesSearch = searchTerm === "" || 
        attempt.students.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.students.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.quizzes.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesQuiz = selectedQuiz === "all" || attempt.quiz_id === selectedQuiz;
      const matchesStudent = selectedStudent === "all" || attempt.student_id === selectedStudent;
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "passed" && attempt.passed) ||
        (selectedStatus === "failed" && !attempt.passed);

      return matchesSearch && matchesQuiz && matchesStudent && matchesStatus;
    });
  }, [attempts, searchTerm, selectedQuiz, selectedStudent, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAttempts.length;
    const passed = filteredAttempts.filter(a => a.passed).length;
    const failed = total - passed;
    const averageScore = total > 0 ? filteredAttempts.reduce((sum, a) => sum + a.score, 0) / total : 0;
    const averageTime = total > 0 ? filteredAttempts.reduce((sum, a) => sum + a.time_taken_seconds, 0) / total : 0;

    return { total, passed, failed, averageScore, averageTime };
  }, [filteredAttempts]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function getScoreColor(score: number, passingScore: number) {
    if (score >= passingScore) return "text-green-600";
    if (score >= passingScore - 10) return "text-yellow-600";
    return "text-red-600";
  }

  function exportToCSV() {
    const headers = ["Student", "Email", "Quiz", "Subject", "Score", "Result", "Time", "Date"];
    const rows = filteredAttempts.map(attempt => [
      attempt.students.full_name || "N/A",
      attempt.students.email,
      attempt.quizzes.title,
      attempt.quizzes.subjects?.name || "N/A",
      `${attempt.score}%`,
      attempt.passed ? "Passed" : "Failed",
      formatTime(attempt.time_taken_seconds),
      formatDate(attempt.submitted_at)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.averageScore)}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Student, email, quiz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quiz</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="All quizzes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  {uniqueQuizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name || student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={exportToCSV} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results ({filteredAttempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No results found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {attempt.students.full_name || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.students.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{attempt.quizzes.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {attempt.quizzes.subjects?.name || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(attempt.score, 50)}`}>
                          {attempt.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={attempt.passed ? "default" : "destructive"}>
                          {attempt.passed ? "Passed" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatTime(attempt.time_taken_seconds)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(attempt.submitted_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAttempt(attempt)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Quiz Attempt Details</DialogTitle>
                            </DialogHeader>
                            {selectedAttempt && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Student</Label>
                                    <p className="font-medium">
                                      {selectedAttempt.students.full_name || selectedAttempt.students.email}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Quiz</Label>
                                    <p className="font-medium">{selectedAttempt.quizzes.title}</p>
                                  </div>
                                  <div>
                                    <Label>Score</Label>
                                    <p className={`font-bold text-lg ${getScoreColor(selectedAttempt.score, 50)}`}>
                                      {selectedAttempt.score}%
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Result</Label>
                                    <Badge variant={selectedAttempt.passed ? "default" : "destructive"}>
                                      {selectedAttempt.passed ? "Passed" : "Failed"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <p className="font-medium">Submitted</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Submitted</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(selectedAttempt.submitted_at)}
                                  </p>
                                </div>
                                <div>
                                  <Label>Answers Summary</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {Object.keys(selectedAttempt.answers).length} questions answered
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
