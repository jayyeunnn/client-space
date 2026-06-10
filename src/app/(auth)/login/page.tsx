"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau password salah. Coba lagi.");
        setLoading(false);
        return;
      }

      // Biarkan loading state tetap aktif selama redirect berlangsung
      window.location.href = redirectTo;
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh]">
      {/* Panel kiri — dark */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "var(--cs-ink)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center font-bold text-white text-[11px]"
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.12)",
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
          <p
            className="text-white font-display"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
            }}
          >
            Satu link untuk semua
            <br />
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              yang perlu klien tahu.
            </span>
          </p>
          <p
            className="mt-4"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}
          >
            Progress, milestone, file, dan invoice — tersaji rapi
            <br />
            di satu halaman. Tanpa klien perlu buat akun.
          </p>
        </div>

        {/* Footer tagline */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          ClientSpace — One link. Full clarity.
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
              style={{
                width: 28,
                height: 28,
                background: "var(--cs-ink)",
                borderRadius: 6,
              }}
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

          <h1
            className="font-display"
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
            Selamat datang kembali
          </h1>
          <p style={{ fontSize: 14, color: "var(--cs-ink3)", marginBottom: 32 }}>
            Masuk ke akun ClientSpace kamu.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label
                htmlFor="email"
                className="font-medium"
                style={{ fontSize: 13, color: "var(--cs-ink2)" }}
              >
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
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1px solid var(--cs-bdh)",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "var(--cs-ink)",
                  background: "var(--cs-surface)",
                  outline: "none",
                  transition: "border-color 0.12s, box-shadow 0.12s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--cs-ac)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--cs-bdh)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="font-medium"
                  style={{ fontSize: 13, color: "var(--cs-ink2)" }}
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "9px 40px 9px 12px",
                    border: "1px solid var(--cs-bdh)",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "var(--cs-ink)",
                    background: "var(--cs-surface)",
                    outline: "none",
                    transition: "border-color 0.12s, box-shadow 0.12s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--cs-ac)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--cs-bdh)";
                    e.target.style.boxShadow = "none";
                  }}
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
              className="flex items-center justify-center gap-2 w-full cursor-pointer font-medium"
              style={{
                padding: "10px 16px",
                background: loading ? "var(--cs-bdh)" : "var(--cs-ink)",
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
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ fontSize: 13, color: "var(--cs-ink3)" }}
          >
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium"
              style={{ color: "var(--cs-ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
