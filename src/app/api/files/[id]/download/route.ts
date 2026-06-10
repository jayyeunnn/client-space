import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { isValidUUID } from "@/lib/utils";

// GET /api/files/[id]/download — return signed URL
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: fileRecord } = await supabase
      .from("files")
      .select("file_path, file_name, projects!inner(freelancer_id)")
      .eq("id", params.id)
      .eq("projects.freelancer_id", user.id)
      .single();

    if (!fileRecord) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

    const admin = createServiceRoleClient();
    const { data, error } = await admin.storage
      .from("project-files")
      .createSignedUrl(fileRecord.file_path, 300); // 5 menit

    if (error || !data) throw error;

    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ error: "Gagal membuat URL download" }, { status: 500 });
  }
}
