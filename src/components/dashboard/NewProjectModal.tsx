"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import type { Project } from "@/types";

interface NewProjectModalProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    document.body.style.overflow = "hidden";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      import("animejs").then(({ animate }) => {
        animate(backdropRef.current!, {
          opacity: [0, 1],
          duration: 180,
          ease: "outQuart",
        });
        animate(panelRef.current!, {
          opacity: [0, 1],
          scale: [0.96, 1],
          translateY: [8, 0],
          duration: 220,
          ease: "outQuart",
        });
      });
    }

    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          client_name: clientName,
          client_email: clientEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat project.");
        return;
      }

      onCreated(data as Project);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid var(--cs-bdh)",
    borderRadius: 6,
    fontSize: 13,
    color: "var(--cs-ink)",
    background: "var(--cs-surface)",
    outline: "none",
    transition: "border-color 0.12s, box-shadow 0.12s",
    fontFamily: "var(--font-ui)",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-ac)";
    e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-bdh)";
    e.target.style.boxShadow = "none";
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 50 }}
      onClick={handleBackdrop}
    >
      <div
        ref={panelRef}
        className="w-full flex flex-col"
        style={{
          maxWidth: 480,
          background: "var(--cs-surface)",
          borderRadius: 10,
          boxShadow: "var(--shadow-xl)",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--cs-bd)" }}
        >
          <h2
            id="modal-title"
            className="font-semibold"
            style={{ fontSize: 15, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
          >
            Project Baru
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "transparent",
              color: "var(--cs-ink3)",
              borderRadius: 5,
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
            aria-label="Tutup modal"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Nama project */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="proj-title" style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink2)" }}>
                Nama project <span style={{ color: "var(--cs-error)" }}>*</span>
              </label>
              <input
                ref={titleRef}
                id="proj-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Redesign Website Startup"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="proj-desc" style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink2)" }}>
                Deskripsi{" "}
                <span style={{ fontSize: 12, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
              </label>
              <textarea
                id="proj-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gambaran singkat project ini..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "none",
                  lineHeight: 1.6,
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Divider info klien */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--cs-ink3)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Info Klien
            </p>

            {/* Nama klien */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="proj-client" style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink2)" }}>
                Nama klien <span style={{ color: "var(--cs-error)" }}>*</span>
              </label>
              <input
                id="proj-client"
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nama klien atau perusahaan"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Email klien */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="proj-email" style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-ink2)" }}>
                Email klien{" "}
                <span style={{ fontSize: 12, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
              </label>
              <input
                id="proj-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="klien@email.com"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                role="alert"
                style={{
                  fontSize: 12,
                  color: "var(--cs-error)",
                  padding: "8px 12px",
                  background: "rgba(220,38,38,0.06)",
                  borderRadius: 6,
                  border: "1px solid rgba(220,38,38,0.15)",
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: "1px solid var(--cs-bd)" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 14px",
                background: "transparent",
                color: "var(--cs-ink3)",
                border: "1px solid var(--cs-bdh)",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 font-medium cursor-pointer"
              style={{
                padding: "8px 16px",
                background: loading ? "var(--cs-bdh)" : "var(--cs-ink)",
                color: loading ? "var(--cs-mu)" : "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.12s",
              }}
            >
              {loading && <Loader2 size={13} strokeWidth={2} className="animate-spin" />}
              {loading ? "Membuat..." : "Buat Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
