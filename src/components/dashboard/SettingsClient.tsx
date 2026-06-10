"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  initialFullName: string;
  initialBusinessName: string | null;
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
  fontFamily: "var(--font-ui)",
  transition: "border-color 0.12s, box-shadow 0.12s",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "var(--cs-ac)";
  e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "var(--cs-bdh)";
  e.target.style.boxShadow = "none";
}

export function SettingsClient({
  userId,
  initialFullName,
  initialBusinessName,
}: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [businessName, setBusinessName] = useState(initialBusinessName ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          business_name: businessName.trim() || null,
        })
        .eq("id", userId);

      if (error) {
        toast.error("Gagal menyimpan. Coba lagi.");
        return;
      }
      toast.success("Profil berhasil disimpan");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[640px]">
      {/* Header */}
      <div className="mb-7">
        <h1
          className="font-semibold"
          style={{ fontSize: 20, color: "var(--cs-ink)", letterSpacing: "-0.02em" }}
        >
          Pengaturan
        </h1>
        <p style={{ fontSize: 13, color: "var(--cs-ink3)", marginTop: 2 }}>
          Kelola informasi profil dan bisnis kamu.
        </p>
      </div>

      {/* Profile card */}
      <div
        style={{
          background: "var(--cs-surface)",
          border: "1px solid var(--cs-bd)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Section header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--cs-bd)" }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "var(--cs-s2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={15} strokeWidth={1.5} style={{ color: "var(--cs-ink3)" }} />
          </div>
          <div>
            <p className="font-semibold" style={{ fontSize: 13, color: "var(--cs-ink)" }}>
              Profil
            </p>
            <p style={{ fontSize: 12, color: "var(--cs-ink3)" }}>
              Nama yang ditampilkan ke klien di portal
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Nama lengkap <span style={{ color: "var(--cs-error)" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap kamu"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Nama bisnis{" "}
              <span style={{ fontSize: 11, color: "var(--cs-mu)", fontWeight: 400 }}>
                (opsional)
              </span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nama studio atau bisnis kamu"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p style={{ fontSize: 11, color: "var(--cs-mu)", lineHeight: 1.5 }}>
              Jika diisi, nama bisnis akan ditampilkan di portal klien sebagai pengganti nama lengkap.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
              style={{
                padding: "8px 16px",
                background: saving ? "var(--cs-bdh)" : "var(--cs-ink)",
                color: saving ? "var(--cs-mu)" : "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = "#292524")}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = "var(--cs-ink)")}
            >
              {saving && <Loader2 size={13} strokeWidth={2} className="animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
