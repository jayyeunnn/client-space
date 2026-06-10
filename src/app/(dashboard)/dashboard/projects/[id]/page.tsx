import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailClient } from "@/components/dashboard/ProjectDetailClient";
import type { Project, Milestone, ProjectFile, Invoice } from "@/types";

interface Props {
  params: { id: string };
  searchParams: { tab?: string };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: project, error: projError },
    { data: milestones },
    { data: files },
    { data: invoice },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .eq("freelancer_id", user.id)
      .single(),
    supabase
      .from("milestones")
      .select("*")
      .eq("project_id", params.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("files")
      .select("*")
      .eq("project_id", params.id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*")
      .eq("project_id", params.id)
      .maybeSingle(),
  ]);

  if (projError || !project) notFound();

  const activeTab = (searchParams.tab === "files" || searchParams.tab === "invoice")
    ? searchParams.tab
    : "milestones";

  return (
    <ProjectDetailClient
      project={project as Project}
      initialMilestones={(milestones as Milestone[]) ?? []}
      initialFiles={(files as ProjectFile[]) ?? []}
      initialInvoice={invoice as Invoice | null}
      activeTab={activeTab}
    />
  );
}
