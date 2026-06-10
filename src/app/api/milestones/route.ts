import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST /api/milestones
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { project_id, title, description, due_date, sort_order } = body;

    if (!title?.trim() || !project_id) {
      return NextResponse.json({ error: "project_id dan title wajib diisi" }, { status: 400 });
    }

    // Pastikan project milik user ini
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("freelancer_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        project_id,
        title: title.trim(),
        description: description?.trim() || null,
        due_date: due_date || null,
        sort_order: sort_order ?? 0,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menambah milestone" }, { status: 500 });
  }
}
