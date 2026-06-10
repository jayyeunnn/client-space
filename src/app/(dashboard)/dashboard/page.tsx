import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Project, ActivityItem } from "@/types";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: projectsRaw }, { data: profile }] = await Promise.all([
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

  const projects: Project[] = (projectsRaw as Project[]) ?? [];
  const projectIds = projects.map((p) => p.id);
  const firstName = profile?.full_name?.split(" ")[0] ?? "kamu";

  // Fetch milestone + file data for all projects
  const [{ data: milestonesRaw }, { data: filesRaw }] = await (
    projectIds.length > 0
      ? Promise.all([
          supabase
            .from("milestones")
            .select("project_id, status, due_date, title, created_at")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false }),
          supabase
            .from("files")
            .select("project_id, file_name, uploaded_at")
            .in("project_id", projectIds)
            .order("uploaded_at", { ascending: false }),
        ])
      : Promise.all([
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
        ])
  );

  // Enrich projects with milestone/file counts
  type RawMilestone = { project_id: string; status: string; due_date: string | null; title: string; created_at: string };
  type RawFile = { project_id: string; file_name: string; uploaded_at: string };

  const milestones: RawMilestone[] = (milestonesRaw as RawMilestone[]) ?? [];
  const files: RawFile[] = (filesRaw as RawFile[]) ?? [];

  const enrichedProjects: Project[] = projects.map((p) => {
    const pMilestones = milestones.filter((m) => m.project_id === p.id);
    const pFiles = files.filter((f) => f.project_id === p.id);
    return {
      ...p,
      milestone_count: pMilestones.length,
      done_count: pMilestones.filter(
        (m) => m.status === "done" || m.status === "approved"
      ).length,
      file_count: pFiles.length,
    };
  });

  // Build recent activity (last 5 events across all projects)
  const projectMap = new Map(projects.map((p) => [p.id, p.title]));
  const today = new Date();

  const milestoneEvents: ActivityItem[] = milestones.slice(0, 10).map((m) => ({
    type: "milestone" as const,
    project_id: m.project_id,
    project_title: projectMap.get(m.project_id) ?? "Project",
    label: m.title,
    date: m.created_at,
  }));

  const fileEvents: ActivityItem[] = files.slice(0, 10).map((f) => ({
    type: "file" as const,
    project_id: f.project_id,
    project_title: projectMap.get(f.project_id) ?? "Project",
    label: f.file_name,
    date: f.uploaded_at,
  }));

  const recentActivity: ActivityItem[] = [...milestoneEvents, ...fileEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Overdue milestone count (for stats)
  const overdueCount = milestones.filter(
    (m) =>
      (m.status === "pending" || m.status === "in_progress") &&
      m.due_date &&
      new Date(m.due_date) < today
  ).length;

  return (
    <DashboardClient
      initialProjects={enrichedProjects}
      firstName={firstName}
      overdueCount={overdueCount}
      recentActivity={recentActivity}
    />
  );
}
