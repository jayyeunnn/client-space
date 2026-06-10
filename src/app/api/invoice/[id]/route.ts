import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isValidUUID } from "@/lib/utils";

function validateInvoiceFields(body: Record<string, unknown>): string | null {
  const numFields = ["subtotal", "tax_rate", "total"] as const;
  for (const f of numFields) {
    if (f in body && (typeof body[f] !== "number" || (body[f] as number) < 0)) {
      return `${f} harus berupa angka non-negatif`;
    }
  }
  if ("items" in body) {
    if (!Array.isArray(body.items) || body.items.length === 0) return "items harus berupa array tidak kosong";
    for (const item of body.items as unknown[]) {
      if (!item || typeof item !== "object") return "Setiap item harus berupa objek";
      const i = item as Record<string, unknown>;
      if (typeof i.description !== "string" || !i.description.trim()) return "Setiap item harus memiliki deskripsi";
      if (typeof i.qty !== "number" || i.qty <= 0) return "qty harus berupa angka positif";
      if (typeof i.rate !== "number" || i.rate < 0) return "rate harus berupa angka non-negatif";
    }
  }
  return null;
}

// PATCH /api/invoice/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
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
    const validationErr = validateInvoiceFields(body);
    if (validationErr) return NextResponse.json({ error: validationErr }, { status: 400 });

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
