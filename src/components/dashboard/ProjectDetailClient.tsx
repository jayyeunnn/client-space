"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Copy,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ProjectBadge } from "@/components/ui/Badge";
import { MilestonesTab } from "@/components/dashboard/MilestonesTab";
import { FilesTab } from "@/components/dashboard/FilesTab";
import { InvoiceTab } from "@/components/dashboard/InvoiceTab";
import type { Project, Milestone, ProjectFile, Invoice } from "@/types";

type Tab = "milestones" | "files" | "invoice";

interface Props {
  project: Project;
  initialMilestones: Milestone[];
  initialFiles: ProjectFile[];
  initialInvoice: Invoice | null;
  activeTab: Tab;
}

const STATUS_LABELS: Record<Project["status"], string> = {
  active: "Aktif",
  completed: "Selesai",
  on_hold: "On Hold",
};

export function ProjectDetailClient({
  project,
  initialMilestones,
  initialFiles,
  initialInvoice,
  activeTab: initialTab,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [projectData, setProjectData] = useState<Project>(project);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const doneCount = milestones.filter(
    (m) => m.status === "done" || m.status === "approved"
  ).length;
  const progressPct =
    milestones.length > 0
      ? Math.round((doneCount / milestones.length) * 100)
      : 0;

  async function copyPortalLink() {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${projectData.portal_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateStatus(newStatus: Project["status"]) {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjectData(updated);
      }
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !progressBarRef.current || progressPct === 0) return;

    import("gsap").then(({ gsap }) => {
      gsap.fromTo(
        progressBarRef.current,
        { width: "0%" },
        { width: `${progressPct}%`, duration: 0.7, ease: "power2.out" }
      );
    });
  }, []);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "milestones", label: "Milestones" },
    { id: "files", label: "Files" },
    { id: "invoice", label: "Invoice" },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header area */}
      <div
        style={{
          borderBottom: "1px solid var(--cs-bd)",
          background: "var(--cs-surface)",
          padding: "16px 16px 0",
        }}
        className="md:px-7 md:pt-5"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-4" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            style={{
              fontSize: 12,
              color: "var(--cs-ink3)",
              textDecoration: "none",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cs-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--cs-ink3)")}
          >
            Dashboard
          </Link>
          <ChevronRight
            size={12}
            strokeWidth={1.5}
            style={{ color: "var(--cs-mu)" }}
          />
          <span
            style={{ fontSize: 12, color: "var(--cs-ink2)", fontWeight: 500 }}
            className="truncate max-w-[200px]"
          >
            {projectData.title}
          </span>
        </nav>

        {/* Project header */}
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1
                className="font-semibold truncate"
                style={{
                  fontSize: 20,
                  color: "var(--cs-ink)",
                  letterSpacing: "-0.02em",
                }}
              >
                {projectData.title}
              </h1>
              <ProjectBadge status={projectData.status} />
            </div>
            <p style={{ fontSize: 13, color: "var(--cs-ink3)" }}>
              {projectData.client_name}
              {projectData.client_email && (
                <span style={{ color: "var(--cs-mu)" }}>
                  {" "}· {projectData.client_email}
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap md:flex-shrink-0">
            {/* Status switcher */}
            <div className="relative">
              <select
                value={projectData.status}
                disabled={statusLoading}
                onChange={(e) => updateStatus(e.target.value as Project["status"])}
                style={{
                  padding: "6px 28px 6px 10px",
                  border: "1px solid var(--cs-bdh)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "var(--cs-ink2)",
                  background: "var(--cs-surface)",
                  cursor: statusLoading ? "not-allowed" : "pointer",
                  outline: "none",
                  appearance: "none",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {(Object.keys(STATUS_LABELS) as Project["status"][]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {statusLoading ? (
                <Loader2
                  size={12}
                  strokeWidth={2}
                  className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--cs-mu)" }}
                />
              ) : (
                <ChevronRight
                  size={12}
                  strokeWidth={1.5}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90"
                  style={{ color: "var(--cs-mu)" }}
                />
              )}
            </div>

            {/* Copy portal link */}
            <button
              onClick={copyPortalLink}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid var(--cs-bdh)",
                borderRadius: 6,
                fontSize: 12,
                color: copied ? "var(--cs-ac)" : "var(--cs-ink2)",
                transition: "background 0.12s, color 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {copied ? (
                <CheckCheck size={13} strokeWidth={2} />
              ) : (
                <Copy size={13} strokeWidth={1.5} />
              )}
              {copied ? "Tersalin!" : "Salin Link Portal"}
            </button>

            {/* Open portal */}
            <a
              href={`/portal/${projectData.portal_token}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buka portal klien"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 44,
                height: 44,
                background: "transparent",
                border: "1px solid var(--cs-bdh)",
                borderRadius: 6,
                color: "var(--cs-ink2)",
                textDecoration: "none",
                transition: "background 0.12s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ExternalLink size={13} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Progress bar — tampil jika ada milestone */}
        {milestones.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: 11, color: "var(--cs-ink3)" }}>
                Progress
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cs-ink2)" }}>
                {doneCount}/{milestones.length} · {progressPct}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: "var(--cs-s2)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                ref={progressBarRef}
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? "var(--cs-ac)" : "var(--cs-ink)",
                  borderRadius: 99,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className="cursor-pointer"
              style={{
                padding: "12px 16px",
                minHeight: 44,
                fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "var(--cs-ink)" : "var(--cs-ink3)",
                background: "transparent",
                border: "none",
                borderBottom: tab === t.id
                  ? "2px solid var(--cs-ink)"
                  : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.12s, border-color 0.12s",
                letterSpacing: tab === t.id ? "-0.01em" : "normal",
              }}
              onMouseEnter={(e) => {
                if (tab !== t.id) e.currentTarget.style.color = "var(--cs-ink2)";
              }}
              onMouseLeave={(e) => {
                if (tab !== t.id) e.currentTarget.style.color = "var(--cs-ink3)";
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — key triggers fade-in on tab change */}
      <div key={tab} className="cs-tab-enter flex-1 p-4 md:p-7">
        {tab === "milestones" && (
          <MilestonesTab
            projectId={projectData.id}
            initialMilestones={milestones}
            onMilestonesChange={setMilestones}
          />
        )}
        {tab === "files" && (
          <FilesTab
            projectId={projectData.id}
            initialFiles={initialFiles}
          />
        )}
        {tab === "invoice" && (
          <InvoiceTab
            projectId={projectData.id}
            initialInvoice={initialInvoice}
          />
        )}
      </div>
    </div>
  );
}
