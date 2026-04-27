"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Settings,
  LogOut,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAVY = "#07104B";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/escalas", label: "Escalas", icon: CalendarDays },
  { href: "/funcionarios", label: "Funcionários", icon: Users },
  { href: "/setores", label: "Setores", icon: Building2 },
  { href: "/usuarios", label: "Usuários", icon: KeyRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-60 flex-col"
      style={{ backgroundColor: NAVY }}
    >
      {/* Logo */}
      <div
        className="flex h-16 shrink-0 items-center gap-3 px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Brand icon: "E" monogram with red background */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: "#CC0F1E" }}
        >
          <span className="text-base font-black italic text-white" style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
            E
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">EscalaFarma</p>
          <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>
            Essencyal Farma
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="relative">
                {active && (
                  <span
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                    style={{ backgroundColor: "#CC0F1E" }}
                  />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ml-[3px]",
                    active
                      ? "text-white"
                      : "hover:text-white"
                  )}
                  style={
                    active
                      ? { backgroundColor: "rgba(255,255,255,0.10)", color: "white" }
                      : { color: "rgba(255,255,255,0.58)" }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.58)";
                    }
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {active && (
                    <ChevronRight
                      className="ml-auto h-3.5 w-3.5"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(204,15,30,0.15)";
            e.currentTarget.style.color = "#FF8080";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
