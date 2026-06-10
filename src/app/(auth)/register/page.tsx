"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            business_name: businessName.trim() || null,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Email ini sudah terdaftar. Coba masuk.");
        } else {
          setError("Gagal membuat akun. Coba beberapa saat lagi.");
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid var(--cs-bdh)",
    borderRadius: 6,
    fontSize: 13,
    color: "var(--cs-ink)",
    background: "var(--cs-surface)",
    outline: "none",
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

  return (
    <div className="flex min-h-[100dvh]">
      {/* Panel kiri — green */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "#15803D" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center font-bold text-white text-[11px]"
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 6,
            }}
          >
            CS
          </div>
          <span
            className="text-white font-semibold"
            style={{ fontSize: 13, letterSpacing: "-0.02em" }}
          >
            ClientSpace
          </span>
        </div>

        {/* Tagline */}
        <div>
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
            }}
          >
            Terlihat profesional
            <br />
            <span style={{ color: "rgba(255,255,255,0.6)" }}>
              dari hari pertama.
            </span>
          </h1>
          <p
            className="mt-4"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}
          >
            Buat project, tambah milestone, upload file, dan kirim
            <br />
            invoice — semuanya dalam satu link ke klien.
          </p>

          {/* Features */}
          <ul className="mt-8 flex flex-col gap-3">
            {[
              "Portal klien tanpa perlu signup",
              "Invoice PDF sekali klik",
              "Update progress real-time",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}
              >
                <span
                  className="flex-shrink-0"
                  style={{
                    width: 18,
                    height: 18,
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "99px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Gratis untuk dipakai. Tidak perlu kartu kredit.
        </p>
      </div>

      {/* Panel kanan — form */}
      <div
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16"
        style={{ background: "var(--cs-surface)" }}
      >
        <div className="w-full max-w-[380px] mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="flex items-center justify-center font-bold text-white text-[11px]"
              style={{ width: 28, height: 28, background: "var(--cs-ink)", borderRadius: 6 }}
            >
              CS
            </div>
            <span
              className="font-semibold"
              style={{ fontSize: 13, color: "var(--cs-ink)", letterSpacing: "-0.02em" }}
            >
              ClientSpace
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 400,
              color: "var(--cs-ink)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              marginBottom: 8,
            }}
          >
            Buat akun gratis
          </h2>
          <p style={{ fontSize: 14, color: "var(--cs-ink3)", marginBottom: 32 }}>
            Mulai kelola project dan klien dengan lebih profesional.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nama lengkap */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="fullName" className="font-medium" style={{ fontSize: 13, color: "var(--cs-ink2)" }}>
                Nama lengkap
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama kamu"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Nama bisnis */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="businessName" className="font-medium" style={{ fontSize: 13, color: "var(--cs-ink2)" }}>
                Nama bisnis{" "}
                <span style={{ fontSize: 12, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
              </label>
              <input
                id="businessName"
                type="text"
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Studio / brand / freelance name"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="email" className="font-medium" style={{ fontSize: 13, color: "var(--cs-ink2)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="password" className="font-medium" style={{ fontSize: 13, color: "var(--cs-ink2)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--cs-mu)" }}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Error message */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full font-medium"
              style={{
                padding: "10px 16px",
                background: loading ? "var(--cs-bdh)" : "var(--cs-ac)",
                color: loading ? "var(--cs-mu)" : "#fff",
                borderRadius: 6,
                fontSize: 13,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.12s",
                marginTop: 4,
              }}
            >
              {loading && <Loader2 size={14} strokeWidth={2} className="animate-spin" />}
              {loading ? "Membuat akun..." : "Daftar Gratis"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 13, color: "var(--cs-ink3)" }}>
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium"
              style={{ color: "var(--cs-ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
