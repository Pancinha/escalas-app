"use client";

import { useState, useCallback } from "react";
import { Employee, OccurrenceType, ScheduleEntry, Schedule } from "@/types";
import { getDaysOfMonth, toDateString, getDayType, getDayAbbr, getInitials } from "@/lib/utils";
import { ScheduleCell } from "./ScheduleCell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Sun, Umbrella, Star } from "lucide-react";

interface ScheduleGridProps {
  schedule: Schedule;
  employees: Employee[];
  entries: ScheduleEntry[];
  occurrenceTypes: OccurrenceType[];
  holidays: string[];
  sectorFilter?: string;
  onEntryChange: (employeeId: string, date: string, type: OccurrenceType | null) => Promise<void>;
}

export function ScheduleGrid({
  schedule,
  employees,
  entries,
  occurrenceTypes,
  holidays,
  sectorFilter,
  onEntryChange,
}: ScheduleGridProps) {
  const [search, setSearch] = useState("");

  const days = getDaysOfMonth(schedule.year, schedule.month);

  const entryMap = new Map<string, ScheduleEntry>();
  for (const e of entries) {
    entryMap.set(`${e.employeeId}-${e.date}`, e);
  }

  const visibleEmployees = employees.filter((emp) => {
    if (!emp.active) return false;
    if (sectorFilter && emp.sectorId !== sectorFilter) return false;
    if (search) return emp.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const readonly = schedule.status === "LOCKED";

  const getSummary = useCallback(
    (employeeId: string) => {
      const emp = entries.filter((e) => e.employeeId === employeeId);
      const counts: Record<string, number> = {};
      for (const e of emp) {
        if (e.occurrenceType) {
          counts[e.occurrenceType.code] = (counts[e.occurrenceType.code] ?? 0) + 1;
        }
      }
      return counts;
    },
    [entries]
  );

  const dayTypes = days.map((d) => getDayType(d, holidays));

  const dayHeaderBg: Record<string, string> = {
    sat: "bg-blue-50 text-blue-700",
    sun: "bg-red-50 text-red-700",
    holiday: "bg-amber-50 text-amber-700",
    normal: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          placeholder="Buscar colaborador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-blue-100 border border-blue-200" /><span>Sábado</span></div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-red-100 border border-red-200" /><span>Domingo</span></div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-amber-100 border border-amber-200" /><span>Feriado</span></div>
        {occurrenceTypes.map((o) => (
          <div key={o.id} className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border" style={{ backgroundColor: o.bgColor, borderColor: o.color + "66" }} />
            <span style={{ color: o.textColor }}>{o.code} — {o.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="border-collapse text-xs" style={{ tableLayout: "fixed", minWidth: `${260 + days.length * 40 + 100}px` }}>
          <thead className="sticky top-0 z-20">
            <tr>
              {/* Employee header */}
              <th
                className="sticky left-0 z-30 h-14 w-64 border-b border-r border-gray-200 bg-gray-50 px-4 text-left text-xs font-semibold text-gray-600"
                style={{ minWidth: 256 }}
              >
                Colaborador
              </th>

              {/* Day headers */}
              {days.map((day, i) => {
                const type = dayTypes[i];
                const isHoliday = type === "holiday";
                return (
                  <th
                    key={i}
                    className={`h-14 w-10 border-b border-r text-center font-medium ${dayHeaderBg[type]}`}
                    style={{ minWidth: 40, maxWidth: 40 }}
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
                      <span className="text-[10px] font-normal opacity-70">
                        {getDayAbbr(day)}
                      </span>
                      <span className="text-sm font-bold">{day.getDate()}</span>
                      {isHoliday && <Star className="h-2.5 w-2.5 text-amber-500" />}
                      {type === "sun" && <Sun className="h-2.5 w-2.5 text-red-400" />}
                      {type === "sat" && <Umbrella className="h-2.5 w-2.5 text-blue-400" />}
                    </div>
                  </th>
                );
              })}

              {/* Summary header */}
              <th className="h-14 w-24 border-b border-gray-200 bg-gray-50 px-2 text-center text-xs font-semibold text-gray-600">
                Resumo
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleEmployees.length === 0 && (
              <tr>
                <td colSpan={days.length + 2} className="py-12 text-center text-sm text-gray-400">
                  Nenhum colaborador encontrado
                </td>
              </tr>
            )}

            {visibleEmployees.map((emp) => {
              const summary = getSummary(emp.id);
              return (
                <tr key={emp.id} className="group hover:bg-gray-50/50 transition-colors">
                  {/* Employee info */}
                  <td
                    className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white group-hover:bg-gray-50/50 px-3 py-2"
                    style={{ minWidth: 256 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback
                          className="text-[10px]"
                          style={{
                            backgroundColor: emp.sector?.color + "20",
                            color: emp.sector?.color,
                          }}
                        >
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900 text-xs">{emp.name}</p>
                        <p className="truncate text-[10px] text-gray-400">{emp.sector?.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {days.map((day, i) => {
                    const dateStr = toDateString(day);
                    const entry = entryMap.get(`${emp.id}-${dateStr}`);
                    return (
                      <ScheduleCell
                        key={i}
                        entry={entry}
                        dayType={dayTypes[i]}
                        occurrenceTypes={occurrenceTypes}
                        readonly={readonly}
                        employeeName={emp.name}
                        date={dateStr}
                        onSave={(type) => onEntryChange(emp.id, dateStr, type)}
                      />
                    );
                  })}

                  {/* Summary */}
                  <td className="border-b border-gray-200 px-2 py-1 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {Object.entries(summary).map(([code, count]) => {
                        const occ = occurrenceTypes.find((o) => o.code === code);
                        if (!occ) return null;
                        return (
                          <span
                            key={code}
                            className="rounded px-1 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: occ.bgColor, color: occ.textColor }}
                          >
                            {code}:{count}
                          </span>
                        );
                      })}
                      {Object.keys(summary).length === 0 && (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
