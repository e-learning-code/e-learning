"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  subjects: { id: string; name: string } | null;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export function QuizTaker({
  quiz,
  questions,
  studentId,
}: {
  quiz: Quiz;
  questions: Question[];
  studentId: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_minutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const submitQuiz = useCallback(async () => {
    setSubmitting(true);

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    // Save attempt to database
    const supabase = createClient();
    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      student_id: studentId,
      score,
      answers,
      time_taken_seconds: quiz.time_limit_minutes * 60 - timeLeft,
    });

    setResult({ score, passed });
    setSubmitting(false);
  }, [answers, questions, quiz.id, quiz.passing_score, quiz.time_limit_minutes, studentId, timeLeft]);

  // Timer
  useEffect(() => {
    if (result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, submitQuiz]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function selectAnswer(questionId: string, answerIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }

  // Result screen
  if (result) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                result.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <CheckCircle
                className={`w-10 h-10 ${
                  result.passed ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <CardTitle className="text-2xl">
              {result.passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-bold text-foreground">{result.score}%</p>
              <p className="text-muted-foreground mt-1">
                {result.passed
                  ? `You passed! (Passing score: ${quiz.passing_score}%)`
                  : `You need ${quiz.passing_score}% to pass`}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted text-left">
              <p className="text-sm text-muted-foreground mb-2">Quiz Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-medium text-green-600">
                    {Math.round((result.score / 100) * questions.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Used:</span>
                  <span className="font-medium">
                    {formatTime(quiz.time_limit_minutes * 60 - timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <a href="/dashboard/quizzes">All Quizzes</a>
              </Button>
              <Button className="flex-1" onClick={() => router.refresh()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.subjects?.name}</p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 60
              ? "bg-red-100 text-red-700"
              : timeLeft < 300
              ? "bg-yellow-100 text-yellow-700"
              : "bg-muted text-foreground"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-normal">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(currentQuestion.id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {questions.map((q, index) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCurrent = index === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isAnswered
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={() => setShowConfirm(true)}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => goToQuestion(currentIndex + 1)}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Submit Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-600">
                  Warning: {questions.length - answeredCount} questions are unanswered.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={submitQuiz} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
