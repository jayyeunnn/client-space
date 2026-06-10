import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/projects/[id] — ambil 1 project + milestones + files + invoice
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .eq("freelancer_id", user.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil project" }, { status: 500 });
  }
}

// PATCH /api/projects/[id] — update project (title, description, client_name, client_email, status)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, client_name, client_email, status } = body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (client_name !== undefined) updates.client_name = client_name.trim();
    if (client_email !== undefined) updates.client_email = client_email?.trim() || null;
    const VALID_STATUSES = ["active", "completed", "on_hold"] as const;
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", params.id)
      .eq("freelancer_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", params.id)
      .eq("freelancer_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus project" }, { status: 500 });
  }
}
