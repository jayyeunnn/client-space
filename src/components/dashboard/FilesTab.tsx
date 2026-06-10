"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, File, Trash2, Loader2, Download, FolderOpen } from "lucide-react";
import type { ProjectFile } from "@/types";

interface Props {
  projectId: string;
  initialFiles: ProjectFile[];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    pdf: "#E53E3E",
    doc: "#3182CE", docx: "#3182CE",
    xls: "#38A169", xlsx: "#38A169",
    ppt: "#D69E2E", pptx: "#D69E2E",
    jpg: "#805AD5", jpeg: "#805AD5", png: "#805AD5", gif: "#805AD5", webp: "#805AD5",
    zip: "#718096", rar: "#718096",
    mp4: "#DD6B20", mov: "#DD6B20",
  };
  return colors[ext ?? ""] ?? "#718096";
}

export function FilesTab({ projectId, initialFiles }: Props) {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Gagal mengupload file");
        return;
      }
      setFiles((prev) => [data, ...prev]);
      toast.success("File berhasil diupload");
    } catch {
      setUploadError("Terjadi kesalahan saat upload. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleDelete(f: ProjectFile) {
    setDeletingId(f.id);
    try {
      await fetch(`/api/files/${f.id}`, { method: "DELETE" });
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
      toast.success("File dihapus");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownload(f: ProjectFile) {
    try {
      const res = await fetch(`/api/files/${f.id}/download`);
      if (!res.ok) { toast.error("Gagal mengunduh file. Coba lagi."); return; }
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      toast.error("Gagal mengunduh file. Coba lagi.");
    }
  }

  return (
    <div className="max-w-[720px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{ fontSize: 14, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
        >
          Files {files.length > 0 && <span style={{ color: "var(--cs-ink3)", fontWeight: 400 }}>({files.length})</span>}
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 font-medium cursor-pointer"
          style={{
            padding: "7px 12px",
            background: "var(--cs-ink)",
            color: uploading ? "var(--cs-mu)" : "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => !uploading && (e.currentTarget.style.background = "#292524")}
          onMouseLeave={(e) => !uploading && (e.currentTarget.style.background = "var(--cs-ink)")}
        >
          {uploading ? (
            <Loader2 size={13} strokeWidth={2} className="animate-spin" />
          ) : (
            <Upload size={13} strokeWidth={1.5} />
          )}
          {uploading ? "Mengupload..." : "Upload File"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept="*/*"
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragOver ? "var(--cs-ac)" : "var(--cs-bd)"}`,
          borderRadius: 8,
          padding: "20px",
          marginBottom: 20,
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          background: dragOver ? "rgba(22,163,74,0.04)" : "transparent",
          transition: "border-color 0.12s, background 0.12s",
        }}
      >
        <Upload size={18} strokeWidth={1.5} style={{ color: "var(--cs-mu)", margin: "0 auto 8px" }} />
        <p style={{ fontSize: 13, color: "var(--cs-ink3)" }}>
          {uploading ? "Mengupload..." : "Drag & drop file atau klik untuk pilih"}
        </p>
        <p style={{ fontSize: 11, color: "var(--cs-mu)", marginTop: 4 }}>
          Semua format file didukung
        </p>
      </div>

      {uploadError && (
        <p
          style={{
            fontSize: 12,
            color: "var(--cs-error)",
            padding: "8px 12px",
            background: "rgba(220,38,38,0.06)",
            borderRadius: 6,
            border: "1px solid rgba(220,38,38,0.15)",
            marginBottom: 16,
          }}
        >
          {uploadError}
        </p>
      )}

      {/* File list */}
      {files.length === 0 ? (
        <EmptyFiles onUpload={() => inputRef.current?.click()} />
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              deleting={deletingId === f.id}
              onDelete={() => handleDelete(f)}
              onDownload={() => handleDownload(f)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({
  file: f,
  deleting,
  onDelete,
  onDownload,
}: {
  file: ProjectFile;
  deleting: boolean;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = getFileIcon(f.file_name);

  return (
    <div
      className="flex items-center gap-3 group"
      style={{
        padding: "11px 14px",
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
      {/* File icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <File size={16} strokeWidth={1.5} style={{ color }} />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="font-medium truncate"
          style={{ fontSize: 13, color: "var(--cs-ink)" }}
        >
          {f.file_name}
        </p>
        <p style={{ fontSize: 11, color: "var(--cs-mu)", marginTop: 1 }}>
          {formatFileSize(f.file_size)} ·{" "}
          {new Date(f.uploaded_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0 flex-shrink-0">
        <button
          onClick={onDownload}
          className="cursor-pointer flex items-center justify-center"
          title="Unduh file"
          style={{
            background: "none",
            border: "none",
            width: 36,
            height: 36,
            borderRadius: 5,
            color: "var(--cs-ink3)",
            transition: "background 0.12s, color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--cs-s2)";
            e.currentTarget.style.color = "var(--cs-ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "var(--cs-ink3)";
          }}
        >
          <Download size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="cursor-pointer flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
          title="Hapus file"
          style={{
            background: "none",
            border: "none",
            width: 36,
            height: 36,
            borderRadius: 5,
            color: "var(--cs-mu)",
            transition: "background 0.12s, color 0.12s, opacity 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.06)";
            e.currentTarget.style.color = "var(--cs-error)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "var(--cs-mu)";
          }}
        >
          {deleting ? (
            <Loader2 size={13} strokeWidth={2} className="animate-spin" />
          ) : (
            <Trash2 size={14} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyFiles({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
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
        }}
      >
        <FolderOpen size={20} strokeWidth={1.5} style={{ color: "var(--cs-mu)" }} />
      </div>
      <p className="font-semibold mb-1" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
        Belum ada file
      </p>
      <p style={{ fontSize: 12, color: "var(--cs-ink3)", marginBottom: 14, lineHeight: 1.6 }}>
        Upload file deliverable untuk dibagikan ke klien.
      </p>
      <button
        onClick={onUpload}
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
        <Upload size={13} strokeWidth={1.5} />
        Upload File Pertama
      </button>
    </div>
  );
}
