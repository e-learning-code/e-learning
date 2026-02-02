"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { id: string; full_name: string | null; email: string; role: string } | null;
  receiver: { id: string; full_name: string | null; email: string; role: string } | null;
}

interface Admin {
  id: string;
  full_name: string | null;
  email: string;
}

export function StudentMessagesView({
  messages,
  admins,
  studentId,
}: {
  messages: Message[];
  admins: Admin[];
  studentId: string;
}) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  // For simplicity, send to first admin or general (no specific receiver)
  const defaultAdmin = admins[0];

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const supabase = createClient();

    await supabase.from("messages").insert({
      sender_id: studentId,
      receiver_id: defaultAdmin?.id || null,
      content: newMessage.trim(),
      is_read: false,
    });

    setNewMessage("");
    setSending(false);
    router.refresh();
  }

  return (
    <Card className="h-[calc(100vh-240px)] flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              A
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">Admin Support</p>
            <p className="text-sm text-muted-foreground">
              Send us a message and we&apos;ll respond as soon as possible
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isStudent = message.sender_id === studentId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isStudent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isStudent
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
    </Card>
  );
}
