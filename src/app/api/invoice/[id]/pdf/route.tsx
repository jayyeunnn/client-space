import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf";
import type { Invoice, Project } from "@/types";

// GET /api/invoice/[id]/pdf
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, projects!inner(*)")
      .eq("id", params.id)
      .eq("projects.freelancer_id", user.id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Ambil profile terpisah
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, business_name")
      .eq("id", user.id)
      .single();

    const project = invoice.projects as unknown as Project;

    const buffer = await renderToBuffer(
      <InvoicePDF
        invoice={invoice as unknown as Invoice}
        project={project}
        freelancerName={profile?.full_name ?? user.email ?? "Freelancer"}
        businessName={profile?.business_name ?? null}
      />
    );

    const fileName = `Invoice-${invoice.invoice_number}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal generate PDF" }, { status: 500 });
  }
}
