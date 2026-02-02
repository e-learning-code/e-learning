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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { EditVideoDialog } from "./edit-video-dialog";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  subject_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  subjects: { name: string } | null;
}

interface Subject {
  id: string;
  name: string;
}

export function VideosTable({
  videos,
  subjects,
}: {
  videos: Video[];
  subjects: Subject[];
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    const supabase = createClient();
    await supabase.from("videos").delete().eq("id", deleteId);

    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  if (videos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No videos yet. Add your first video to get started.
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
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{video.title}</p>
                    {video.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {video.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {video.subjects?.name || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>{video.order_index}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      video.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {video.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(video.created_at).toLocaleDateString()}
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
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Video
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditVideo(video)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(video.id)}
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
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be
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

      {editVideo && (
        <EditVideoDialog
          video={editVideo}
          subjects={subjects}
          open={!!editVideo}
          onOpenChange={(open) => !open && setEditVideo(null)}
        />
      )}
    </>
  );
}
