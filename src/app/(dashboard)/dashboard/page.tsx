import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Project } from "@/types";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("freelancer_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("full_name, business_name")
      .eq("id", user.id)
      .single(),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "kamu";

  return (
    <DashboardClient
      initialProjects={(projects as Project[]) ?? []}
      firstName={firstName}
    />
  );
}
