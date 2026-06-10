import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-admin";

// GET /api/portal/[token]/files/[fileId] — public signed URL untuk download
export async function GET(
  _req: Request,
  { params }: { params: { token: string; fileId: string } }
) {
  try {
    const admin = createServiceRoleClient();

    // Validasi token dan pastikan file milik project ini
    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("portal_token", params.token)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Portal tidak ditemukan" }, { status: 404 });
    }

    const { data: fileRecord } = await admin
      .from("files")
      .select("file_path, file_name")
      .eq("id", params.fileId)
      .eq("project_id", project.id)
      .single();

    if (!fileRecord) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const { data, error } = await admin.storage
      .from("project-files")
      .createSignedUrl(fileRecord.file_path, 300); // 5 menit

    if (error || !data) throw error;

    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ error: "Gagal membuat URL download" }, { status: 500 });
  }
}
