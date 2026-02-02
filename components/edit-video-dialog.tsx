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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  subject_id: string;
  order_index: number;
  is_active: boolean;
}

interface Subject {
  id: string;
  name: string;
}

export function EditVideoDialog({
  video,
  subjects,
  open,
  onOpenChange,
}: {
  video: Video;
  subjects: Subject[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || "");
  const [videoUrl, setVideoUrl] = useState(video.video_url);
  const [subjectId, setSubjectId] = useState(video.subject_id);
  const [orderIndex, setOrderIndex] = useState(video.order_index.toString());
  const [isActive, setIsActive] = useState(video.is_active);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("videos")
      .update({
        title,
        description: description || null,
        video_url: videoUrl,
        subject_id: subjectId,
        order_index: parseInt(orderIndex) || 1,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    setLoading(false);

    if (!error) {
      onOpenChange(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>Update the video details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Video Title</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Introduction to Algebra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Brief description of the video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-videoUrl">Video URL</Label>
            <Input
              id="edit-videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-orderIndex">Order</Label>
            <Input
              id="edit-orderIndex"
              type="number"
              min="1"
              placeholder="1"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-isActive">Active</Label>
            <Switch
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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
