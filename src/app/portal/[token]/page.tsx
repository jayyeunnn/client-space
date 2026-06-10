import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase-admin";
import { PortalView } from "@/components/portal/PortalView";
import type { Metadata } from "next";
import type { PortalData } from "@/types";

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const admin = createServiceRoleClient();
  const { data: project } = await admin
    .from("projects")
    .select("title, client_name")
    .eq("portal_token", params.token)
    .single();

  if (!project) return { title: "Portal Tidak Ditemukan" };

  const title = `${project.title} — ClientSpace`;
  const description = `Lihat progress, milestone, dan invoice untuk project "${project.title}".`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PortalPage({ params }: Props) {
  const admin = createServiceRoleClient();

  const { data: project, error } = await admin
    .from("projects")
    .select("*")
    .eq("portal_token", params.token)
    .single();

  if (error || !project) notFound();

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

  const portalData: PortalData = {
    project: {
      ...project,
      profiles: profile ?? { full_name: "", business_name: null },
    } as PortalData["project"],
    milestones: milestones ?? [],
    files: files ?? [],
    invoice: invoice ?? null,
  };

  return <PortalView data={portalData} />;
}
