export const OCCURRENCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  F: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
  A: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  LK: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  FER: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  AFT: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
  TRES: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
};

export const DAY_TYPE_STYLES = {
  sat: "bg-blue-50",
  sun: "bg-red-50",
  holiday: "bg-yellow-50",
  normal: "bg-white",
};

export const SECTOR_COLORS = [
  "#059669",
  "#0EA5E9",
  "#7C3AED",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MANAGER", label: "Gestor" },
  { value: "VIEWER", label: "Visualizador" },
];

export const SCHEDULE_STATUSES = [
  { value: "DRAFT", label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  { value: "PUBLISHED", label: "Publicada", color: "bg-emerald-100 text-emerald-700" },
  { value: "LOCKED", label: "Bloqueada", color: "bg-orange-100 text-orange-700" },
];
