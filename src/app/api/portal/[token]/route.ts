import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-admin";

// GET /api/portal/[token] — public endpoint, no auth required
export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const admin = createServiceRoleClient();

    const { data: project, error } = await admin
      .from("projects")
      .select("*")
      .eq("portal_token", params.token)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Portal tidak ditemukan" }, { status: 404 });
    }

    const [
      { data: milestones },
      { data: files },
      { data: invoice },
      { data: profile },
    ] = await Promise.all([
      admin
        .from("milestones")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true }),
      admin
        .from("files")
        .select("*")
        .eq("project_id", project.id)
        .order("uploaded_at", { ascending: false }),
      admin
        .from("invoices")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("full_name, business_name")
        .eq("id", project.freelancer_id)
        .single(),
    ]);

    return NextResponse.json({
      project: {
        ...project,
        profiles: profile ?? { full_name: "", business_name: null },
      },
      milestones: milestones ?? [],
      files: files ?? [],
      invoice: invoice ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
