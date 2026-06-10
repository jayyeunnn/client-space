import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

// POST /api/invoice — buat invoice baru
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { project_id, items, subtotal, tax_rate, total, due_date, notes } = body;

    if (!project_id || !items?.length) {
      return NextResponse.json({ error: "project_id dan items wajib ada" }, { status: 400 });
    }

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
