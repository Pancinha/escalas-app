"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Schedule, Employee, ScheduleEntry, OccurrenceType, Holiday, Sector } from "@/types";
import { getMonthName, statusLabel } from "@/lib/utils";
import { Loader2, CheckCircle, Lock, ChevronDown } from "lucide-react";

const statusVariantMap: Record<string, "draft" | "published" | "locked"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  LOCKED: "locked",
};

export default function EscalaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [occurrenceTypes, setOccurrenceTypes] = useState<OccurrenceType[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    const [schedRes, occRes, secRes] = await Promise.all([
      fetch(`/api/schedules/${id}`),
      fetch("/api/occurrence-types"),
      fetch("/api/sectors"),
    ]);

    const sched: Schedule & { entries: ScheduleEntry[] } = await schedRes.json();
    const occs: OccurrenceType[] = await occRes.json();
    const secs: Sector[] = await secRes.json();

    setSchedule(sched);
    setEntries(sched.entries ?? []);
    setOccurrenceTypes(occs);
    setSectors(secs);

    const holRes = await fetch(`/api/holidays?year=${sched.year}`);
    const hols: Holiday[] = await holRes.json();
    setHolidays(hols.map((h) => h.date));

    const empRes = await fetch(`/api/employees?unitId=${sched.unitId}&active=true`);
    const emps: Employee[] = await empRes.json();
    setEmployees(emps);

    setLoading(false);
  }, [id]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  const handleEntryChange = useCallback(
    async (employeeId: string, date: string, type: OccurrenceType | null) => {
      setSaving(true);

      const res = await fetch(`/api/schedules/${id}/entries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date,
          occurrenceTypeId: type?.id ?? null,
        }),
      });

      if (res.ok) {
        const updated: ScheduleEntry & { occurrenceType?: OccurrenceType } = await res.json();
        setEntries((prev) => {
          const idx = prev.findIndex(
            (e) => e.employeeId === employeeId && e.date === date
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...updated, scheduleId: id };
            return next;
          }
          return [...prev, { ...updated, scheduleId: id }];
        });
      }
      setSaving(false);
    },
    [id]
  );

  async function handleStatusChange(status: string) {
    const res = await fetch(`/api/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(status === "PUBLISHED" && { publishedAt: new Date().toISOString() }) }),
    });
    if (res.ok) {
      const updated: Schedule = await res.json();
      setSchedule((prev) => prev ? { ...prev, status: updated.status } : null);
    }
  }

  if (loading || !schedule) {
    return (
      <AppLayout>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </AppLayout>
    );
  }

  const monthName = getMonthName(schedule.month, schedule.year);

  return (
    <AppLayout>
      <Header
        title={`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${schedule.year}`}
        description={`${schedule.unit?.name} — ${employees.length} colaboradores`}
        actions={
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}

            <Badge variant={statusVariantMap[schedule.status] ?? "draft"}>
              {statusLabel(schedule.status)}
            </Badge>

            {/* Sector filter */}
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setSectorFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${sectorFilter === "all" ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Todos
              </button>
              {sectors.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSectorFilter(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${sectorFilter === s.id ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  style={sectorFilter === s.id ? { backgroundColor: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {schedule.status === "DRAFT" && (
              <Button size="sm" className="gap-1.5" onClick={() => handleStatusChange("PUBLISHED")}>
                <CheckCircle className="h-3.5 w-3.5" />
                Publicar
              </Button>
            )}
            {schedule.status === "PUBLISHED" && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleStatusChange("LOCKED")}>
                <Lock className="h-3.5 w-3.5" />
                Bloquear
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-hidden p-4">
        <ScheduleGrid
          schedule={schedule}
          employees={employees}
          entries={entries}
          occurrenceTypes={occurrenceTypes}
          holidays={holidays}
          sectorFilter={sectorFilter === "all" ? undefined : sectorFilter}
          onEntryChange={handleEntryChange}
        />
      </main>
    </AppLayout>
  );
}
