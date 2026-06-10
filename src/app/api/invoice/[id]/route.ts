import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// PATCH /api/invoice/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Pastikan invoice milik project milik user
    const { data: existing } = await supabase
      .from("invoices")
      .select("id, projects!inner(freelancer_id)")
      .eq("id", params.id)
      .eq("projects.freelancer_id", user.id)
      .single();

    if (!existing) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

    const body = await request.json();
    const allowed = ["items", "subtotal", "tax_rate", "total", "due_date", "notes"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate invoice" }, { status: 500 });
  }
}
