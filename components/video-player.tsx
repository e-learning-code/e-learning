"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return url;
  }

  return null;
}

export function VideoPlayer({ video, index }: { video: Video; index: number }) {
  const [expanded, setExpanded] = useState(index === 1);
  const embedUrl = getEmbedUrl(video.video_url);
  const isDirectVideo = video.video_url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
              {index}
            </div>
            {video.title}
          </CardTitle>
          <Button variant="ghost" size="icon">
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {video.description && (
            <p className="text-sm text-muted-foreground">{video.description}</p>
          )}

          {embedUrl ? (
            isDirectVideo ? (
              <video
                src={embedUrl}
                controls
                className="w-full aspect-video rounded-lg bg-black"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center aspect-video bg-muted rounded-lg">
              <Play className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Unable to embed this video
              </p>
              <Button variant="outline" asChild>
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Video
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
