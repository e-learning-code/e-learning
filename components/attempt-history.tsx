"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface Attempt {
  id: string;
  score: number;
  passed: boolean;
  attempt_number: number;
  time_taken_seconds: number;
  submitted_at: string;
}

interface AttemptHistoryProps {
  quizId: string;
  studentId: string;
  currentAttempt?: number;
}

export function AttemptHistory({ quizId, studentId, currentAttempt }: AttemptHistoryProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("student_id", studentId)
        .order("submitted_at", { ascending: false });

      setAttempts(data || []);
      setLoading(false);
    };

    fetchAttempts();
  }, [quizId, studentId]);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function getScoreTrend(currentScore: number, previousScore?: number) {
    if (!previousScore) return null;
    if (currentScore > previousScore) return "up";
    if (currentScore < previousScore) return "down";
    return "same";
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attempt History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Attempt History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attempts.map((attempt, index) => {
            const isCurrentAttempt = attempt.attempt_number === currentAttempt;
            const previousAttempt = attempts[index + 1];
            const trend = getScoreTrend(attempt.score, previousAttempt?.score);

            return (
              <div
                key={attempt.id}
                className={`p-4 rounded-lg border ${
                  isCurrentAttempt
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={isCurrentAttempt ? "default" : "secondary"}>
                      Attempt #{attempt.attempt_number}
                    </Badge>
                    {isCurrentAttempt && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {attempt.passed && (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Passed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {trend === "up" && (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    )}
                    {trend === "down" && (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span>{formatDate(attempt.submitted_at)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {attempt.score}%
                    </div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(attempt.time_taken_seconds)}
                    </div>
                    <div className="text-muted-foreground">Time</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      attempt.passed ? "text-green-600" : "text-red-600"
                    }`}>
                      {attempt.passed ? "✓" : "✗"}
                    </div>
                    <div className="text-muted-foreground">Result</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {attempts.length > 1 && (
          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-sm text-muted-foreground">
              Total Attempts: {attempts.length} | 
              Best Score: {Math.max(...attempts.map(a => a.score))}% | 
              Average: {Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
