import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isValidUUID } from "@/lib/utils";

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

function validateItems(items: unknown[]): string | null {
  for (const item of items) {
    if (!item || typeof item !== "object") return "Setiap item harus berupa objek";
    const i = item as Record<string, unknown>;
    if (typeof i.description !== "string" || !i.description.trim()) return "Setiap item harus memiliki deskripsi";
    if (typeof i.qty !== "number" || i.qty <= 0) return "qty harus berupa angka positif";
    if (typeof i.rate !== "number" || i.rate < 0) return "rate harus berupa angka non-negatif";
  }
  return null;
}

// POST /api/invoice — buat invoice baru
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { project_id, items, subtotal, tax_rate, total, due_date, notes } = body;

    if (!project_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "project_id dan items wajib ada" }, { status: 400 });
    }
    if (!isValidUUID(project_id)) return NextResponse.json({ error: "project_id tidak valid" }, { status: 400 });

    const itemErr = validateItems(items);
    if (itemErr) return NextResponse.json({ error: itemErr }, { status: 400 });

    if (typeof subtotal !== "number" || subtotal < 0) return NextResponse.json({ error: "subtotal harus berupa angka non-negatif" }, { status: 400 });
    if (typeof total !== "number" || total < 0) return NextResponse.json({ error: "total harus berupa angka non-negatif" }, { status: 400 });
    if (tax_rate !== undefined && (typeof tax_rate !== "number" || tax_rate < 0)) return NextResponse.json({ error: "tax_rate harus berupa angka non-negatif" }, { status: 400 });

    // Pastikan project milik user
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("freelancer_id", user.id)
      .single();

    if (!project) return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        project_id,
        invoice_number: generateInvoiceNumber(),
        items,
        subtotal,
        tax_rate: tax_rate ?? 0,
        total,
        due_date: due_date || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat invoice" }, { status: 500 });
  }
}
