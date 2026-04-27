import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getDaysInMonth,
  format,
  parseISO,
  isSaturday,
  isSunday,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDaysOfMonth(year: number, month: number): Date[] {
  const count = getDaysInMonth(new Date(year, month - 1));
  return Array.from({ length: count }, (_, i) => new Date(year, month - 1, i + 1));
}

export function formatDate(date: string | Date, fmt = "dd/MM/yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: ptBR });
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isWeekend(date: Date): boolean {
  return isSaturday(date) || isSunday(date);
}

export function getDayType(date: Date, holidays: string[]): "sat" | "sun" | "holiday" | "normal" {
  if (isSunday(date)) return "sun";
  if (isSaturday(date)) return "sat";
  const ds = toDateString(date);
  if (holidays.includes(ds)) return "holiday";
  return "normal";
}

export function getDayAbbr(date: Date): string {
  return format(date, "EEE", { locale: ptBR }).slice(0, 3);
}

export function getMonthName(month: number, year?: number): string {
  const d = new Date(year ?? 2025, month - 1, 1);
  return format(d, "MMMM", { locale: ptBR });
}

export function getMonthNameShort(month: number): string {
  const d = new Date(2025, month - 1, 1);
  return format(d, "MMM", { locale: ptBR });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function roleName(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    VIEWER: "Visualizador",
  };
  return map[role] ?? role;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicada",
    LOCKED: "Bloqueada",
  };
  return map[status] ?? status;
}
