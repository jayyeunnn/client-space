import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/projects — list semua project milik freelancer
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("freelancer_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data project" }, { status: 500 });
  }
}

// POST /api/projects — buat project baru
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, client_name, client_email } = body;

    if (!title?.trim() || !client_name?.trim()) {
      return NextResponse.json(
        { error: "Nama project dan nama klien wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        freelancer_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        client_name: client_name.trim(),
        client_email: client_email?.trim() || null,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat project" }, { status: 500 });
  }
}
