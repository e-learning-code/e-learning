"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Circle, Trash2 } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { id: string; full_name: string | null; email: string } | null;
  receiver: { id: string; full_name: string | null; email: string } | null;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string;
}

export function AdminMessagesView({
  messages,
  students,
}: {
  messages: Message[];
  students: Student[];
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getAdmin() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);
    }
    getAdmin();
  }, []);

  // Group messages by student
  const studentConversations = students.map((student) => {
    const studentMessages = messages.filter(
      (m) => m.sender_id === student.id || m.receiver_id === student.id
    );
    const unreadCount = studentMessages.filter(
      (m) => m.sender_id === student.id && !m.is_read
    ).length;
    const lastMessage = studentMessages[0];

    return {
      student,
      messages: studentMessages,
      unreadCount,
      lastMessage,
    };
  }).filter((c) => c.messages.length > 0 || selectedStudent?.id === c.student.id);

  // Get conversation with selected student
  const conversation = selectedStudent
    ? messages
      .filter(
        (m) =>
          m.sender_id === selectedStudent.id ||
          m.receiver_id === selectedStudent.id
      )
      .reverse()
    : [];

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent || !adminId) return;

    setSending(true);
    const supabase = createClient();

    await supabase.from("messages").insert({
      sender_id: adminId,
      receiver_id: selectedStudent.id,
      content: newMessage.trim(),
      is_read: false,
    });

    setNewMessage("");
    setSending(false);
    router.refresh();
  }

  async function markAsRead(studentId: string) {
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", studentId)
      .eq("is_read", false);
    router.refresh();
  }

  async function handleClearChat() {
    if (!selectedStudent) return;
    if (!confirm(`Are you sure you want to clear all messages with ${selectedStudent.full_name || selectedStudent.email}? This action cannot be undone.`)) {
      return;
    }

    setClearing(true);
    const supabase = createClient();

    // Delete all messages in this conversation
    await supabase
      .from("messages")
      .delete()
      .or(`sender_id.eq.${selectedStudent.id},receiver_id.eq.${selectedStudent.id}`);

    setClearing(false);
    setSelectedStudent(null);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Conversations</h2>
        </div>
        <ScrollArea className="flex-1">
          {studentConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {studentConversations.map(({ student, unreadCount, lastMessage }) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    if (unreadCount > 0) markAsRead(student.id);
                  }}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${selectedStudent?.id === student.id ? "bg-muted" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(student.full_name || student.email)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground truncate">
                          {student.full_name || student.email}
                        </p>
                        {unreadCount > 0 && (
                          <Circle className="w-2 h-2 fill-primary text-primary" />
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Message Thread */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedStudent ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(selectedStudent.full_name || selectedStudent.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedStudent.full_name || "No name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>
                {conversation.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    disabled={clearing}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {clearing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Chat
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversation.map((message) => {
                  const isAdmin = message.sender_id === adminId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isAdmin
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                          }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${isAdmin
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                            }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <form
              onSubmit={handleSend}
              className="p-4 border-t border-border flex gap-2"
            >
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </Card>
    </div>
  );
}
