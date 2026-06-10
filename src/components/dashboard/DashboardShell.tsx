"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface Props {
  children: React.ReactNode;
  fullName: string;
  businessName: string | null;
}

export function DashboardShell({ children, fullName, businessName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tutup sidebar saat navigasi
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: "var(--cs-bg)" }}>
      {/* Sidebar desktop — selalu tampil ≥ md */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar fullName={fullName} businessName={businessName} />
      </div>

      {/* Drawer overlay mobile — always in DOM for fade transition */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar mobile — slide-in */}
      <div
        className="fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200"
        style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <Sidebar fullName={fullName} businessName={businessName} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <main className="flex-1 overflow-y-auto min-w-0" style={{ background: "var(--cs-bg)" }}>
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 md:hidden px-4 py-3 sticky top-0 z-30"
          style={{
            background: "var(--cs-surface)",
            borderBottom: "1px solid var(--cs-bd)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 44,
              height: 44,
              background: "transparent",
              border: "none",
              color: "var(--cs-ink)",
              borderRadius: 6,
            }}
            aria-label="Buka menu"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: 24,
                height: 24,
                background: "var(--cs-ink)",
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              CS
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-ink)", letterSpacing: "-0.02em" }}>
              ClientSpace
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
