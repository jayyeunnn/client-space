import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";

async function getOwnedFile(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, fileId: string, userId: string) {
  const { data } = await supabase
    .from("files")
    .select("id, file_path, projects!inner(freelancer_id)")
    .eq("id", fileId)
    .eq("projects.freelancer_id", userId)
    .single();
  return data;
}

// DELETE /api/files/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const fileRecord = await getOwnedFile(supabase, params.id, user.id);
    if (!fileRecord) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

    const admin = createServiceRoleClient();
    await admin.storage.from("project-files").remove([fileRecord.file_path]);

    const { error } = await supabase.from("files").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
}
