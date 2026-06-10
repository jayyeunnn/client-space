import { type ProjectStatus, type MilestoneStatus } from "@/types";

const PROJECT_STATUS: Record<ProjectStatus, { label: string; bg: string; color: string }> = {
  active:    { label: "Aktif",    bg: "#DCFCE7", color: "#15803D" },
  completed: { label: "Selesai", bg: "#E5E7EB", color: "#374151" },
  on_hold:   { label: "On Hold", bg: "#F5F5F4", color: "#78716C" },
};

const MILESTONE_STATUS: Record<MilestoneStatus, { label: string; bg: string; color: string }> = {
  pending:     { label: "Pending",     bg: "#FEF9C3", color: "#854D0E" },
  in_progress: { label: "In Progress", bg: "#DBEAFE", color: "#1E40AF" },
  done:        { label: "Done",        bg: "#F0FDF4", color: "#166534" },
  approved:    { label: "Approved",    bg: "#DCFCE7", color: "#15803D" },
};

export function ProjectBadge({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  const s = MILESTONE_STATUS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}
