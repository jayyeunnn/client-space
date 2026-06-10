"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  File,
  Download,
  FileText,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import type { PortalData, MilestoneStatus } from "@/types";

interface Props {
  data: PortalData;
}

type Tab = "milestones" | "files" | "invoice";

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "Sedang dikerjakan",
  done: "Selesai",
  approved: "Disetujui",
};

const STATUS_ICON: Record<MilestoneStatus, React.ReactNode> = {
  pending: <Circle size={15} strokeWidth={1.5} style={{ color: "#A8A29E" }} />,
  in_progress: <Clock size={15} strokeWidth={1.5} style={{ color: "#3B82F6" }} />,
  done: <CheckCircle2 size={15} strokeWidth={1.5} style={{ color: "#16A34A" }} />,
  approved: <CheckCircle2 size={15} strokeWidth={2} style={{ color: "#16A34A" }} />,
};

const STATUS_BADGE: Record<MilestoneStatus, { bg: string; color: string }> = {
  pending:     { bg: "#F5F5F4", color: "#78716C" },
  in_progress: { bg: "#DBEAFE", color: "#1E40AF" },
  done:        { bg: "#F0FDF4", color: "#166534" },
  approved:    { bg: "#DCFCE7", color: "#15803D" },
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isInvoiceOverdue(due_date: string | null) {
  if (!due_date) return false;
  return new Date(due_date) < new Date();
}

export function PortalView({ data }: Props) {
  const { project, milestones, files, invoice } = data;
  const [tab, setTab] = useState<Tab>("milestones");

  const freelancerName =
    (project.profiles as { full_name: string; business_name: string | null } | null)
      ?.business_name ||
    (project.profiles as { full_name: string; business_name: string | null } | null)
      ?.full_name ||
    "Freelancer";

  const doneCount = milestones.filter(
    (m) => m.status === "done" || m.status === "approved"
  ).length;

  const progressPct =
    milestones.length > 0
      ? Math.round((doneCount / milestones.length) * 100)
      : 0;

  const mobileTabs: { id: Tab; label: string }[] = [
    { id: "milestones", label: `Milestones (${milestones.length})` },
    { id: "files", label: `Files (${files.length})` },
    { id: "invoice", label: "Invoice" },
  ];

  const desktopTabs: { id: Tab; label: string }[] = [
    { id: "milestones", label: `Milestones (${milestones.length})` },
    { id: "files", label: `Files (${files.length})` },
  ];

  const overdue = isInvoiceOverdue(invoice?.due_date ?? null);

  async function downloadFile(fileId: string, fileName: string) {
    try {
      const res = await fetch(`/api/portal/${project.portal_token}/files/${fileId}`);
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.target = "_blank";
      a.click();
    } catch {
      toast.error("Gagal mengunduh file. Coba lagi.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--cs-bg)",
        fontFamily: "var(--font-ui)",
      }}
    >
      <Toaster position="top-right" />

      {/* Top bar */}
      <header
        style={{
          background: "var(--cs-surface)",
          borderBottom: "1px solid var(--cs-bd)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 26,
                height: 26,
                background: "var(--cs-ink)",
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              CS
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--cs-ink)",
                letterSpacing: "-0.02em",
              }}
            >
              ClientSpace
            </span>
          </div>
          <span style={{ fontSize: 11, color: "var(--cs-mu)" }}>
            Portal oleh {freelancerName}
          </span>
        </div>
      </header>

      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 64px" }}
        className="md:px-8 md:pt-8"
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* ─── Left column ─── */}
          <div className="flex-1 min-w-0 w-full">
            {/* Project header */}
            <div className="mb-7">
              <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "var(--cs-ink)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.25,
                      marginBottom: 4,
                    }}
                  >
                    {project.title}
                  </h1>
                  {project.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--cs-ink3)",
                        lineHeight: 1.7,
                        maxWidth: 520,
                      }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 500,
                    background:
                      project.status === "active"
                        ? "#DCFCE7"
                        : project.status === "completed"
                        ? "#E5E7EB"
                        : "#F5F5F4",
                    color:
                      project.status === "active"
                        ? "#15803D"
                        : project.status === "completed"
                        ? "#374151"
                        : "#78716C",
                  }}
                >
                  {project.status === "active"
                    ? "Aktif"
                    : project.status === "completed"
                    ? "Selesai"
                    : "On Hold"}
                </span>
              </div>

              {/* Progress bar */}
              {milestones.length > 0 && (
                <div
                  style={{
                    background: "var(--cs-surface)",
                    border: "1px solid var(--cs-bd)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    marginTop: 16,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 12, color: "var(--cs-ink3)", fontWeight: 500 }}>
                      Progress
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cs-ink)" }}>
                      {doneCount}/{milestones.length} milestone · {progressPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--cs-s2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: "var(--cs-ac)",
                        borderRadius: 99,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop tabs: Milestones + Files only */}
            <div
              className="hidden md:flex"
              style={{ borderBottom: "1px solid var(--cs-bd)", marginBottom: 24, gap: 0 }}
            >
              {desktopTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id === "milestones" || t.id === "files" ? t.id : "milestones")}
                  style={{
                    padding: "12px 16px",
                    minHeight: 44,
                    fontSize: 13,
                    fontWeight: tab === t.id ? 600 : 400,
                    color: tab === t.id ? "var(--cs-ink)" : "var(--cs-ink3)",
                    background: "transparent",
                    border: "none",
                    borderBottom: tab === t.id ? "2px solid var(--cs-ink)" : "2px solid transparent",
                    marginBottom: -1,
                    cursor: "pointer",
                    transition: "color 0.12s",
                    letterSpacing: tab === t.id ? "-0.01em" : "normal",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Mobile tabs: all 3 */}
            <div
              className="flex md:hidden"
              style={{ borderBottom: "1px solid var(--cs-bd)", marginBottom: 24, gap: 0 }}
            >
              {mobileTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "12px 14px",
                    minHeight: 44,
                    fontSize: 12,
                    fontWeight: tab === t.id ? 600 : 400,
                    color: tab === t.id ? "var(--cs-ink)" : "var(--cs-ink3)",
                    background: "transparent",
                    border: "none",
                    borderBottom: tab === t.id ? "2px solid var(--cs-ink)" : "2px solid transparent",
                    marginBottom: -1,
                    cursor: "pointer",
                    transition: "color 0.12s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div key={tab} className="cs-tab-enter">
              {tab === "milestones" && <MilestonesSection milestones={milestones} />}
              {tab === "files" && <FilesSection files={files} onDownload={downloadFile} />}
              {tab === "invoice" && (
                <div className="md:hidden">
                  <InvoiceSection invoice={invoice} />
                </div>
              )}
            </div>
          </div>

          {/* ─── Right sidebar (desktop only) ─── */}
          <div className="hidden md:flex flex-col gap-4 w-[270px] flex-shrink-0">
            {/* Invoice summary card */}
            <div
              style={{
                background: "var(--cs-surface)",
                border: "1px solid var(--cs-bd)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--cs-bd)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FileText size={14} strokeWidth={1.5} style={{ color: "var(--cs-ink3)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cs-ink)" }}>
                  Invoice
                </span>
              </div>

              {invoice ? (
                <div style={{ padding: "14px 16px" }} className="flex flex-col gap-3">
                  <div>
                    <p style={{ fontSize: 11, color: "var(--cs-mu)", marginBottom: 3 }}>Nomor</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink)" }}>
                      #{invoice.invoice_number}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--cs-mu)", marginBottom: 3 }}>Total</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--cs-ink)", letterSpacing: "-0.02em" }}>
                      {formatRupiah(invoice.total)}
                    </p>
                  </div>
                  {invoice.due_date && (
                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: 7,
                        background: overdue ? "rgba(220,38,38,0.06)" : "var(--cs-s2)",
                        border: `1px solid ${overdue ? "rgba(220,38,38,0.15)" : "var(--cs-bd)"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      {overdue ? (
                        <AlertCircle size={13} strokeWidth={1.5} style={{ color: "var(--cs-error)", flexShrink: 0 }} />
                      ) : (
                        <CalendarDays size={13} strokeWidth={1.5} style={{ color: "var(--cs-ink3)", flexShrink: 0 }} />
                      )}
                      <div>
                        <p style={{ fontSize: 10, color: overdue ? "var(--cs-error)" : "var(--cs-ink3)", fontWeight: 500 }}>
                          {overdue ? "Sudah jatuh tempo" : "Jatuh tempo"}
                        </p>
                        <p style={{ fontSize: 11, color: overdue ? "var(--cs-error)" : "var(--cs-ink)", fontWeight: 500 }}>
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </div>
                  )}
                  {invoice.tax_rate > 0 && (
                    <p style={{ fontSize: 11, color: "var(--cs-mu)" }}>
                      Sudah termasuk PPN {invoice.tax_rate}%
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ padding: "20px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--cs-ink3)" }}>Invoice belum dibuat</p>
                </div>
              )}
            </div>

            {/* Project quick info */}
            <div
              style={{
                background: "var(--cs-surface)",
                border: "1px solid var(--cs-bd)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <p style={{ fontSize: 10, color: "var(--cs-mu)", marginBottom: 3, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Dibuat oleh
                </p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink)" }}>
                  {freelancerName}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p style={{ fontSize: 10, color: "var(--cs-mu)", marginBottom: 3, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Files
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--cs-ink)" }}>{files.length}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "var(--cs-mu)", marginBottom: 3, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Milestone
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--cs-ink)" }}>{milestones.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Milestones ─── */
function MilestonesSection({
  milestones,
}: {
  milestones: PortalData["milestones"];
}) {
  if (milestones.length === 0) {
    return (
      <Empty
        icon={<CheckCircle2 size={22} strokeWidth={1.5} />}
        title="Belum ada milestone"
        desc="Freelancer belum menambahkan milestone untuk project ini."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {milestones.map((m) => {
        const badge = STATUS_BADGE[m.status];
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "13px 16px",
              background: "var(--cs-surface)",
              border: "1px solid var(--cs-bd)",
              borderRadius: 8,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              {STATUS_ICON[m.status]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: m.description || m.due_date ? 4 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--cs-ink)",
                    textDecoration:
                      m.status === "approved" ? "line-through" : "none",
                    opacity: m.status === "approved" ? 0.6 : 1,
                  }}
                >
                  {m.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: badge.bg,
                    color: badge.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              {m.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--cs-ink3)",
                    lineHeight: 1.6,
                    marginBottom: m.due_date ? 4 : 0,
                  }}
                >
                  {m.description}
                </p>
              )}
              {m.due_date && (
                <p style={{ fontSize: 11, color: "var(--cs-mu)" }}>
                  Tenggat: {formatDate(m.due_date)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Files ─── */
function FilesSection({
  files,
  onDownload,
}: {
  files: PortalData["files"];
  onDownload: (id: string, name: string) => void;
}) {
  if (files.length === 0) {
    return (
      <Empty
        icon={<File size={22} strokeWidth={1.5} />}
        title="Belum ada file"
        desc="Freelancer belum mengupload file deliverable."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map((f) => (
        <div
          key={f.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 16px",
            background: "var(--cs-surface)",
            border: "1px solid var(--cs-bd)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--cs-s2)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <File size={15} strokeWidth={1.5} style={{ color: "var(--cs-ink3)" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--cs-ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {f.file_name}
            </p>
            <p style={{ fontSize: 11, color: "var(--cs-mu)", marginTop: 1 }}>
              {formatFileSize(f.file_size)}
              {f.file_size ? " · " : ""}
              {formatDate(f.uploaded_at)}
            </p>
          </div>
          <button
            onClick={() => onDownload(f.id, f.file_name)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "10px 14px",
              minHeight: 44,
              background: "transparent",
              border: "1px solid var(--cs-bdh)",
              borderRadius: 5,
              fontSize: 12,
              color: "var(--cs-ink2)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.12s",
              fontFamily: "var(--font-ui)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Download size={12} strokeWidth={1.5} />
            Unduh
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Invoice ─── */
function InvoiceSection({ invoice }: { invoice: PortalData["invoice"] }) {
  if (!invoice) {
    return (
      <Empty
        icon={<FileText size={22} strokeWidth={1.5} />}
        title="Belum ada invoice"
        desc="Freelancer belum membuat invoice untuk project ini."
      />
    );
  }

  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Invoice number header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--cs-bd)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-ink)" }}
        >
          Invoice #{invoice.invoice_number}
        </span>
        {invoice.due_date && (
          <span style={{ fontSize: 12, color: "var(--cs-ink3)" }}>
            Jatuh tempo: {formatDate(invoice.due_date)}
          </span>
        )}
      </div>

      {/* Items */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 400,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-bd)" }}>
              {["Deskripsi", "Qty", "Harga", "Total"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--cs-ink3)",
                    textAlign: h !== "Deskripsi" ? "right" : "left",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--cs-bd)" }}>
                <td
                  style={{
                    padding: "11px 16px",
                    fontSize: 13,
                    color: "var(--cs-ink)",
                  }}
                >
                  {item.description}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontSize: 13,
                    color: "var(--cs-ink3)",
                    textAlign: "right",
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontSize: 13,
                    color: "var(--cs-ink3)",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatRupiah(item.rate)}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--cs-ink)",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatRupiah(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          borderTop: "1px solid var(--cs-bd)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 13,
            color: "var(--cs-ink3)",
          }}
        >
          <span>Subtotal</span>
          <span style={{ color: "var(--cs-ink)", minWidth: 120, textAlign: "right" }}>
            {formatRupiah(invoice.subtotal)}
          </span>
        </div>
        {invoice.tax_rate > 0 && (
          <div
            style={{
              display: "flex",
              gap: 40,
              fontSize: 13,
              color: "var(--cs-ink3)",
            }}
          >
            <span>PPN ({invoice.tax_rate}%)</span>
            <span style={{ color: "var(--cs-ink)", minWidth: 120, textAlign: "right" }}>
              {formatRupiah(invoice.total - invoice.subtotal)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 40,
            paddingTop: 8,
            borderTop: "1px solid var(--cs-bd)",
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 600, color: "var(--cs-ink)" }}
          >
            Total
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--cs-ink)",
              minWidth: 120,
              textAlign: "right",
            }}
          >
            {formatRupiah(invoice.total)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid var(--cs-bd)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--cs-ink3)",
              lineHeight: 1.7,
            }}
          >
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ─── */
function Empty({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: "var(--cs-s2)",
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          color: "var(--cs-mu)",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--cs-ink)",
          marginBottom: 6,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--cs-ink3)",
          lineHeight: 1.6,
          maxWidth: 300,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
