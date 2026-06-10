import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isValidUUID } from "@/lib/utils";

async function ownsProject(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, milestoneId: string, userId: string) {
  const { data } = await supabase
    .from("milestones")
    .select("id, projects!inner(freelancer_id)")
    .eq("id", milestoneId)
    .eq("projects.freelancer_id", userId)
    .single();
  return !!data;
}

// PATCH /api/milestones/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await ownsProject(supabase, params.id, user.id))) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const VALID_MILESTONE_STATUSES = ["pending", "in_progress", "done", "approved"] as const;
    if ("status" in body && !VALID_MILESTONE_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Status milestone tidak valid" }, { status: 400 });
    }
    const allowed = ["title", "description", "status", "due_date", "sort_order"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from("milestones")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate milestone" }, { status: 500 });
  }
}

// DELETE /api/milestones/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await ownsProject(supabase, params.id, user.id))) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    const { error } = await supabase.from("milestones").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus milestone" }, { status: 500 });
  }
}
