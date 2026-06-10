"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  businessName: string | null;
  fullName: string;
  onClose?: () => void;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

const bottomNavItems = [
  {
    href: "/dashboard/settings",
    label: "Pengaturan",
    icon: Settings,
  },
];

export function Sidebar({ businessName, fullName, onClose }: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function isNavActive(href: string) {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        (pathname.startsWith("/dashboard/") &&
          !pathname.startsWith("/dashboard/settings"))
      );
    }
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col h-full"
      style={{ width: "188px", background: "var(--cs-sb)", flexShrink: 0 }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-[14px] py-[13px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center font-bold text-white text-[11px]"
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 6,
              letterSpacing: "-0.02em",
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
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer md:hidden"
            style={{
              width: 44,
              height: 44,
              background: "transparent",
              border: "none",
              borderRadius: 6,
              color: "rgba(255,255,255,0.6)",
            }}
            aria-label="Tutup menu"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2 px-[10px] mx-1 my-[1px] rounded-[5px] transition-colors duration-[120ms]"
              style={{
                fontSize: 12,
                minHeight: 44,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                background: isActive
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div
          style={{
            margin: "8px 10px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        />

        {/* Bottom nav items (Settings) */}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2 px-[10px] mx-1 my-[1px] rounded-[5px] transition-colors duration-[120ms]"
              style={{
                fontSize: 12,
                minHeight: 44,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                background: isActive
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-[10px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{
              width: 28,
              height: 28,
              background: "rgba(255,255,255,0.12)",
              borderRadius: "99px",
              fontSize: 10,
            }}
          >
            {getInitials(fullName || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-white truncate font-medium"
              style={{ fontSize: 11 }}
            >
              {businessName || fullName}
            </p>
            {businessName && (
              <p
                className="truncate"
                style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
              >
                {fullName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-[10px] rounded-[5px] transition-colors duration-[120ms] cursor-pointer"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minHeight: 44 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
