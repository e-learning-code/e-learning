import { createClient } from "@/lib/server";
import { VideosTable } from "@/components/videos-table";
import { AddVideoDialog } from "@/components/add-video-dialog";

export default async function VideosPage() {
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select(`
      *,
      subjects:subject_id (name)
    `)
    .order("created_at", { ascending: false });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Videos</h1>
          <p className="text-muted-foreground mt-1">
            Manage video content for your subjects.
          </p>
        </div>
        <AddVideoDialog subjects={subjects || []} />
      </div>

      <VideosTable videos={videos || []} subjects={subjects || []} />
    </div>
  );
}
