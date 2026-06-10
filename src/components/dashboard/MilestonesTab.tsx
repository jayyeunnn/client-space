"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, CheckCircle2, Circle, Clock, Loader2, Trash2, GripVertical } from "lucide-react";
import { MilestoneBadge } from "@/components/ui/Badge";
import type { Milestone, MilestoneStatus } from "@/types";

interface Props {
  projectId: string;
  initialMilestones: Milestone[];
  onMilestonesChange?: (milestones: Milestone[]) => void;
}

const STATUS_CYCLE: Record<MilestoneStatus, MilestoneStatus> = {
  pending: "in_progress",
  in_progress: "done",
  done: "approved",
  approved: "pending",
};

const STATUS_ICONS: Record<MilestoneStatus, React.ReactNode> = {
  pending: <Circle size={16} strokeWidth={1.5} style={{ color: "var(--cs-mu)" }} />,
  in_progress: <Clock size={16} strokeWidth={1.5} style={{ color: "#3B82F6" }} />,
  done: <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: "var(--cs-ac)" }} />,
  approved: <CheckCircle2 size={16} strokeWidth={2} style={{ color: "var(--cs-ac)" }} />,
};

export function MilestonesTab({ projectId, initialMilestones, onMilestonesChange }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  function updateMilestones(next: Milestone[]) {
    setMilestones(next);
    onMilestonesChange?.(next);
  }
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          sort_order: milestones.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menambah milestone"); return; }
      updateMilestones([...milestones, data]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
      toast.success("Milestone ditambahkan");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusCycle(m: Milestone) {
    setUpdatingId(m.id);
    const next = STATUS_CYCLE[m.status];
    try {
      const res = await fetch(`/api/milestones/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        updateMilestones(milestones.map((x) => x.id === m.id ? updated : x));
        toast.success("Status diperbarui");
      } else {
        toast.error("Gagal mengubah status. Coba lagi.");
      }
    } catch {
      toast.error("Gagal mengubah status. Coba lagi.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus milestone. Coba lagi."); return; }
      updateMilestones(milestones.filter((m) => m.id !== id));
      toast.success("Milestone dihapus");
    } catch {
      toast.error("Gagal menghapus milestone. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid var(--cs-bdh)",
    borderRadius: 6,
    fontSize: 13,
    color: "var(--cs-ink)",
    background: "var(--cs-surface)",
    outline: "none",
    fontFamily: "var(--font-ui)",
    transition: "border-color 0.12s, box-shadow 0.12s",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-ac)";
    e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-bdh)";
    e.target.style.boxShadow = "none";
  }

  const doneCount = milestones.filter(
    (m) => m.status === "done" || m.status === "approved"
  ).length;

  return (
    <div className="max-w-[720px]">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="font-semibold"
            style={{ fontSize: 14, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
          >
            Milestones
          </h2>
          {milestones.length > 0 && (
            <p style={{ fontSize: 12, color: "var(--cs-ink3)", marginTop: 2 }}>
              {doneCount} dari {milestones.length} selesai
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-1.5 font-medium cursor-pointer"
          style={{
            padding: "7px 12px",
            background: "var(--cs-ink)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
        >
          <Plus size={13} strokeWidth={2} />
          Tambah Milestone
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 flex flex-col gap-3"
          style={{
            background: "var(--cs-surface)",
            border: "1px solid var(--cs-bd)",
            borderRadius: 8,
            padding: "16px",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Nama milestone <span style={{ color: "var(--cs-error)" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Desain wireframe"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Deskripsi <span style={{ fontSize: 11, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail milestone ini..."
              rows={2}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Tenggat waktu <span style={{ fontSize: 11, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...inputStyle, width: "auto", maxWidth: 180 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          {error && (
            <p style={{ fontSize: 12, color: "var(--cs-error)" }}>{error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
              style={{
                padding: "7px 14px",
                background: saving ? "var(--cs-bdh)" : "var(--cs-ink)",
                color: saving ? "var(--cs-mu)" : "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving && <Loader2 size={12} strokeWidth={2} className="animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(""); setDescription(""); setDueDate(""); setError(null); }}
              style={{
                padding: "7px 14px",
                background: "transparent",
                color: "var(--cs-ink3)",
                border: "1px solid var(--cs-bdh)",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Milestone list */}
      {milestones.length === 0 && !showForm ? (
        <EmptyMilestones onAdd={() => setShowForm(true)} />
      ) : (
        <div className="flex flex-col gap-2">
          {milestones.map((m) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              updating={updatingId === m.id}
              deleting={deletingId === m.id}
              onStatusClick={() => handleStatusCycle(m)}
              onDelete={() => handleDelete(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  milestone: m,
  updating,
  deleting,
  onStatusClick,
  onDelete,
}: {
  milestone: Milestone;
  updating: boolean;
  deleting: boolean;
  onStatusClick: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-start gap-3 group"
      style={{
        padding: "12px 14px",
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        transition: "border-color 0.12s",
        borderColor: hovered ? "var(--cs-bdh)" : "var(--cs-bd)",
        opacity: deleting ? 0.5 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle — visual only */}
      <GripVertical
        size={14}
        strokeWidth={1.5}
        style={{
          color: "var(--cs-mu)",
          marginTop: 1,
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      />

      {/* Status icon button */}
      <button
        onClick={onStatusClick}
        disabled={updating}
        className="cursor-pointer flex-shrink-0 flex items-center justify-center"
        title="Klik untuk ubah status"
        style={{ background: "none", border: "none", padding: 0, width: 44, height: 44, margin: "-12px 0" }}
      >
        {updating ? (
          <Loader2 size={16} strokeWidth={2} className="animate-spin" style={{ color: "var(--cs-mu)" }} />
        ) : (
          STATUS_ICONS[m.status]
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-medium"
            style={{
              fontSize: 13,
              color: "var(--cs-ink)",
              textDecoration: m.status === "approved" ? "line-through" : "none",
              opacity: m.status === "approved" ? 0.6 : 1,
            }}
          >
            {m.title}
          </span>
          <MilestoneBadge status={m.status} />
        </div>
        {m.description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--cs-ink3)",
              marginTop: 3,
              lineHeight: 1.6,
            }}
          >
            {m.description}
          </p>
        )}
        {m.due_date && (
          <p style={{ fontSize: 11, color: "var(--cs-mu)", marginTop: 4 }}>
            Tenggat: {new Date(m.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Delete — selalu visible di mobile, hover-only di desktop */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="cursor-pointer flex-shrink-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
        title="Hapus milestone"
        style={{
          background: "none",
          border: "none",
          width: 44,
          height: 44,
          margin: "-12px -2px",
          borderRadius: 6,
          color: "var(--cs-mu)",
          transition: "color 0.12s, opacity 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cs-error)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--cs-mu)")}
      >
        {deleting ? (
          <Loader2 size={13} strokeWidth={2} className="animate-spin" />
        ) : (
          <Trash2 size={13} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}

function EmptyMilestones({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        style={{
          width: 44,
          height: 44,
          background: "var(--cs-s2)",
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <CheckCircle2 size={20} strokeWidth={1.5} style={{ color: "var(--cs-mu)" }} />
      </div>
      <p className="font-semibold mb-1" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
        Belum ada milestone
      </p>
      <p style={{ fontSize: 12, color: "var(--cs-ink3)", marginBottom: 16, lineHeight: 1.6 }}>
        Tambah milestone untuk tracking progress project.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 font-medium cursor-pointer"
        style={{
          padding: "7px 14px",
          background: "var(--cs-ink)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
      >
        <Plus size={13} strokeWidth={2} />
        Tambah Milestone Pertama
      </button>
    </div>
  );
}
