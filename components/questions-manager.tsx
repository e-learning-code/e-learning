"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Plus, Trash2, Loader2, GripVertical, Edit2, Save, X } from "lucide-react";

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  sort_order: number;
}

export function QuestionsManager({
  quizId,
  questions: initialQuestions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingOptions, setEditingOptions] = useState(["", "", "", ""]);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(0);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();

    console.log("Form submission:", {
      newQuestion: newQuestion.trim(),
      newOptions: newOptions.map(o => o.trim()),
      newCorrectAnswer,
      quizId
    });

    if (!newQuestion.trim() || newOptions.some((o) => !o.trim())) {
      console.log("Validation failed - empty fields");
      return;
    }

    setAdding(true);
    const supabase = createClient();

    console.log("Inserting data:", {
        quiz_id: quizId,
        question_text: newQuestion.trim(),
        option_a: newOptions[0].trim(),
        option_b: newOptions[1].trim(),
        option_c: newOptions[2].trim(),
        option_d: newOptions[3].trim(),
        correct_answer: String.fromCharCode(65 + newCorrectAnswer),
        sort_order: questions.length + 1,
      });

    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        question_text: newQuestion.trim(),
        option_a: newOptions[0].trim(),
        option_b: newOptions[1].trim(),
        option_c: newOptions[2].trim(),
        option_d: newOptions[3].trim(),
        correct_answer: String.fromCharCode(65 + newCorrectAnswer),
        sort_order: questions.length + 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding question:", error);
    }

    if (!error && data) {
      setQuestions([...questions, data]);
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setNewCorrectAnswer(0);
    }

    setAdding(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("quiz_questions").delete().eq("id", deleteId);

    setQuestions(questions.filter((q) => q.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  async function handleUpdate() {
    if (!editingId || !editingQuestion.trim() || editingOptions.some((o) => !o.trim())) {
      return;
    }

    setUpdating(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("quiz_questions")
      .update({
        question_text: editingQuestion.trim(),
        option_a: editingOptions[0].trim(),
        option_b: editingOptions[1].trim(),
        option_c: editingOptions[2].trim(),
        option_d: editingOptions[3].trim(),
        correct_answer: String.fromCharCode(65 + editingCorrectAnswer),
      })
      .eq("id", editingId)
      .select()
      .single();

    if (!error && data) {
      setQuestions(questions.map((q) => (q.id === editingId ? data : q)));
      setEditingId(null);
      setEditingQuestion("");
      setEditingOptions(["", "", "", ""]);
      setEditingCorrectAnswer(0);
    }

    setUpdating(false);
    router.refresh();
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditingQuestion(question.question_text);
    // Convert individual options to array for editing
    const options = [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d
    ];
    setEditingOptions(options);
    // Convert text-based correct answer to number
    const correctAnswerIndex = question.correct_answer 
      ? question.correct_answer.charCodeAt(0) - 65 
      : 0;
    setEditingCorrectAnswer(correctAnswerIndex);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingQuestion("");
    setEditingOptions(["", "", "", ""]);
    setEditingCorrectAnswer(0);
  }

  function updateEditingOption(index: number, value: string) {
    const updated = [...editingOptions];
    updated[index] = value;
    setEditingOptions(updated);
  }

  function updateOption(index: number, value: string) {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  }

  return (
    <div className="space-y-6">
      {/* Existing Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No questions yet. Add your first question below.
            </p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      {editingId === question.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-question-${question.id}`}>Question</Label>
                            <Textarea
                              id={`edit-question-${question.id}`}
                              value={editingQuestion}
                              onChange={(e) => setEditingQuestion(e.target.value)}
                              rows={2}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Options (select the correct answer)</Label>
                            <RadioGroup
                              value={editingCorrectAnswer.toString()}
                              onValueChange={(v) => setEditingCorrectAnswer(parseInt(v))}
                            >
                              {editingOptions.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={optIndex.toString()}
                                    id={`edit-option-${question.id}-${optIndex}`}
                                  />
                                  <span className="font-medium text-muted-foreground w-6">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <Input
                                    value={option}
                                    onChange={(e) => updateEditingOption(optIndex, e.target.value)}
                                    required
                                  />
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleUpdate}
                              disabled={updating}
                            >
                              {updating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={updating}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-base">
                            Question {index + 1}
                          </CardTitle>
                          <p className="text-foreground mt-1">
                            {question.question_text}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId !== question.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(question)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {editingId !== question.id && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      question.option_a,
                      question.option_b,
                      question.option_c,
                      question.option_d
                    ].map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          question.correct_answer === String.fromCharCode(65 + optIndex)
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Options (select the correct answer)</Label>
              <RadioGroup
                value={newCorrectAnswer.toString()}
                onValueChange={(v) => setNewCorrectAnswer(parseInt(v))}
              >
                {newOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <span className="font-medium text-muted-foreground w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
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
    </div>
  );
}
