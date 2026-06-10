import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-admin";

// POST /api/files — upload file ke Supabase Storage
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("project_id") as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: "file dan project_id wajib ada" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 50MB" }, { status: 413 });
    }

    // Pastikan project milik user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("freelancer_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    // Path: user_id/project_id/timestamp_filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${projectId}/${timestamp}_${safeName}`;

    const admin = createServiceRoleClient();
    const { error: uploadError } = await admin.storage
      .from("project-files")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Simpan metadata ke DB
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      })
      .select()
      .single();

    if (dbError) {
      // Rollback storage
      await admin.storage.from("project-files").remove([filePath]);
      throw dbError;
    }

    return NextResponse.json(fileRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}
