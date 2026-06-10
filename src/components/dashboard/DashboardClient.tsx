"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, FolderOpen, ExternalLink, Copy, CheckCheck, FileUp, CheckCircle2 } from "lucide-react";
import { ProjectBadge } from "@/components/ui/Badge";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";
import { formatDateShort } from "@/lib/utils";
import type { Project, ActivityItem } from "@/types";

interface DashboardClientProps {
  initialProjects: Project[];
  firstName: string;
  overdueCount: number;
  recentActivity: ActivityItem[];
}

export function DashboardClient({ initialProjects, firstName, overdueCount, recentActivity }: DashboardClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    import("animejs").then(({ animate, stagger }) => {
      if (statsRef.current) {
        animate(statsRef.current.children, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 280,
          delay: stagger(60),
          ease: "outQuart",
        });
      }
    });
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !cardsRef.current) return;

    import("animejs").then(({ animate, stagger }) => {
      if (cardsRef.current) {
        animate(cardsRef.current.children, {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 320,
          delay: stagger(50, { start: 80 }),
          ease: "outQuart",
        });
      }
    });
  }, [projects.length]);

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    overdue: overdueCount,
    clients: new Set(projects.map((p) => p.client_name)).size,
  };

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowModal(false);
  }

  async function copyPortalLink(project: Project) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${project.portal_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(project.id);
    toast.success("Link portal tersalin");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="p-4 md:p-8 max-w-[1160px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1
            className="font-semibold"
            style={{ fontSize: 22, color: "var(--cs-ink)", letterSpacing: "-0.02em" }}
          >
            Halo, {firstName}
          </h1>
          <p style={{ fontSize: 13, color: "var(--cs-ink3)", marginTop: 2 }}>
            Kelola semua project dan klien kamu di sini.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 font-medium cursor-pointer"
          style={{
            padding: "8px 14px",
            background: "var(--cs-ink)",
            color: "#fff",
            borderRadius: 6,
            fontSize: 13,
            border: "none",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
        >
          <Plus size={14} strokeWidth={2} />
          Project Baru
        </button>
      </div>

      {/* Stats row */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Project", value: stats.total, variant: "default" as const },
          { label: "Aktif", value: stats.active, variant: "accent" as const },
          { label: "Overdue", value: stats.overdue, variant: stats.overdue > 0 ? "warn" : "default" as "warn" | "default" },
          { label: "Total Klien", value: stats.clients, variant: "default" as const },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background:
                stat.variant === "accent"
                  ? "var(--cs-acl)"
                  : stat.variant === "warn" && stat.value > 0
                  ? "rgba(220,38,38,0.05)"
                  : "var(--cs-surface)",
              border: `1px solid ${
                stat.variant === "accent"
                  ? "var(--cs-acm)"
                  : stat.variant === "warn" && stat.value > 0
                  ? "rgba(220,38,38,0.18)"
                  : "var(--cs-bd)"
              }`,
              borderRadius: 8,
              padding: "11px 14px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color:
                  stat.variant === "accent"
                    ? "var(--cs-ac)"
                    : stat.variant === "warn" && stat.value > 0
                    ? "var(--cs-error)"
                    : "var(--cs-ink3)",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {stat.label}
            </p>
            <p
              className="font-semibold"
              style={{
                fontSize: 22,
                color:
                  stat.variant === "accent"
                    ? "var(--cs-ac)"
                    : stat.variant === "warn" && stat.value > 0
                    ? "var(--cs-error)"
                    : "var(--cs-ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Project grid */}
      {projects.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-semibold"
              style={{ fontSize: 14, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
            >
              Project ({projects.length})
            </h2>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                copied={copiedId === project.id}
                onCopy={copyPortalLink}
              />
            ))}

            {/* Add new card */}
            <button
              onClick={() => setShowModal(true)}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full"
              style={{
                border: "1.5px dashed var(--cs-bd)",
                borderRadius: 8,
                padding: "32px 16px",
                background: "transparent",
                color: "var(--cs-ink3)",
                fontSize: 13,
                transition: "border-color 0.12s, background 0.12s, color 0.12s",
                minHeight: 120,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--cs-bdh)";
                e.currentTarget.style.background = "var(--cs-s2)";
                e.currentTarget.style.color = "var(--cs-ink2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--cs-bd)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--cs-ink3)";
              }}
            >
              <Plus size={18} strokeWidth={1.5} />
              <span>Project Baru</span>
            </button>
          </div>
        </>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="mt-8">
          <h2
            className="font-semibold mb-3"
            style={{ fontSize: 14, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
          >
            Aktivitas Terbaru
          </h2>
          <div
            style={{
              background: "var(--cs-surface)",
              border: "1px solid var(--cs-bd)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {recentActivity.map((item, i) => (
              <Link
                key={`${item.type}-${i}`}
                href={`/dashboard/projects/${item.project_id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="flex items-center gap-3 group"
                  style={{
                    padding: "11px 14px",
                    borderBottom:
                      i < recentActivity.length - 1
                        ? "1px solid var(--cs-bd)"
                        : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "var(--cs-s2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "transparent")
                  }
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background:
                        item.type === "milestone"
                          ? "var(--cs-acl)"
                          : "var(--cs-s2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.type === "milestone" ? (
                      <CheckCircle2
                        size={13}
                        strokeWidth={1.5}
                        style={{ color: "var(--cs-ac)" }}
                      />
                    ) : (
                      <FileUp
                        size={13}
                        strokeWidth={1.5}
                        style={{ color: "var(--cs-ink3)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ fontSize: 12, color: "var(--cs-ink)" }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{ fontSize: 11, color: "var(--cs-mu)", marginTop: 1 }}
                    >
                      {item.project_title} ·{" "}
                      {item.type === "milestone"
                        ? "Milestone ditambahkan"
                        : "File diupload"}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--cs-mu)", flexShrink: 0 }}>
                    {formatDateShort(item.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  copied,
  onCopy,
}: {
  project: Project;
  copied: boolean;
  onCopy: (p: Project) => void;
}) {
  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        padding: "14px 16px",
        transition: "border-color 0.12s, box-shadow 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cs-bdh)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cs-bd)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="font-semibold hover:underline"
          style={{
            fontSize: 14,
            color: "var(--cs-ink)",
            letterSpacing: "-0.01em",
            textDecoration: "none",
            textUnderlineOffset: 3,
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {project.title}
        </Link>
        <ProjectBadge status={project.status} />
      </div>

      {/* Client */}
      <p style={{ fontSize: 12, color: "var(--cs-ink3)", marginBottom: 10 }}>
        {project.client_name}
        {project.client_email && (
          <span style={{ color: "var(--cs-mu)" }}> · {project.client_email}</span>
        )}
      </p>

      {/* Progress bar (if milestones exist) */}
      {project.milestone_count !== undefined && project.milestone_count > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 10,
                  color: "var(--cs-ink3)",
                  fontWeight: 500,
                }}
              >
                {project.done_count}/{project.milestone_count} milestone
              </span>
              {project.file_count !== undefined && project.file_count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--cs-mu)",
                    padding: "1px 6px",
                    borderRadius: 99,
                    background: "var(--cs-s2)",
                  }}
                >
                  {project.file_count} file
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--cs-ink3)" }}>
              {project.milestone_count > 0
                ? Math.round(((project.done_count ?? 0) / project.milestone_count) * 100)
                : 0}%
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
              style={{
                height: "100%",
                width: `${
                  project.milestone_count > 0
                    ? Math.round(((project.done_count ?? 0) / project.milestone_count) * 100)
                    : 0
                }%`,
                background: "var(--cs-ac)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <p
          style={{
            fontSize: 12,
            color: "var(--cs-ink3)",
            lineHeight: 1.6,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ borderTop: "1px solid var(--cs-bd)", paddingTop: 10, marginTop: 4 }}
      >
        <span style={{ fontSize: 11, color: "var(--cs-mu)" }}>
          {formatDateShort(project.updated_at)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCopy(project)}
            title="Salin link portal"
            className="flex items-center gap-1 cursor-pointer"
            style={{
              padding: "4px 8px",
              borderRadius: 5,
              fontSize: 11,
              color: copied ? "var(--cs-ac)" : "var(--cs-ink3)",
              background: "transparent",
              border: "none",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {copied ? <CheckCheck size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.5} />}
            {copied ? "Tersalin" : "Salin Link"}
          </button>
          <Link
            href={`/dashboard/projects/${project.id}`}
            aria-label="Buka detail project"
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 5,
              color: "var(--cs-ink3)",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cs-s2)";
              e.currentTarget.style.color = "var(--cs-ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--cs-ink3)";
            }}
          >
            <ExternalLink size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="flex items-center justify-center mb-5"
        style={{
          width: 52,
          height: 52,
          background: "var(--cs-s2)",
          borderRadius: "99px",
        }}
      >
        <FolderOpen size={22} strokeWidth={1.5} style={{ color: "var(--cs-mu)" }} />
      </div>
      <h3
        className="font-semibold mb-2"
        style={{ fontSize: 15, color: "var(--cs-ink)" }}
      >
        Belum ada project
      </h3>
      <p
        className="mb-6 max-w-[280px]"
        style={{ fontSize: 13, color: "var(--cs-ink3)", lineHeight: 1.6 }}
      >
        Buat project pertama kamu dan bagikan link portal ke klien.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 font-medium cursor-pointer"
        style={{
          padding: "8px 16px",
          background: "var(--cs-ink)",
          color: "#fff",
          borderRadius: 6,
          fontSize: 13,
          border: "none",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
      >
        <Plus size={14} strokeWidth={2} />
        Buat Project Pertama
      </button>
    </div>
  );
}
