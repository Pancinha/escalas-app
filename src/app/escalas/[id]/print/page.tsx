"use client";

import { useEffect, useState, use } from "react";
import { getDaysOfMonth, toDateString, getDayType, getDayAbbr, getMonthName, formatDate } from "@/lib/utils";
import { Employee, OccurrenceType, ScheduleEntry, Schedule, Holiday } from "@/types";

interface PrintData {
  schedule: Schedule;
  employees: Employee[];
  entries: ScheduleEntry[];
  occurrenceTypes: OccurrenceType[];
  holidays: string[];
}

export default function PrintSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [schedRes, occRes] = await Promise.all([
          fetch(`/api/schedules/${id}`),
          fetch("/api/occurrence-types"),
        ]);
        if (!schedRes.ok) { setNotFound(true); setLoading(false); return; }

        const sched: Schedule & { entries: ScheduleEntry[] } = await schedRes.json();
        const occs: OccurrenceType[] = occRes.ok ? await occRes.json() : [];

        const [holRes, empRes] = await Promise.all([
          fetch(`/api/holidays?year=${sched.year}`),
          fetch(`/api/employees?unitId=${sched.unitId}&active=true`),
        ]);
        const hols: Holiday[] = holRes.ok ? await holRes.json() : [];
        const emps: Employee[] = empRes.ok ? await empRes.json() : [];

        setData({
          schedule: sched,
          employees: emps,
          entries: sched.entries ?? [],
          occurrenceTypes: occs,
          holidays: hols.map((h) => h.date),
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif", color: "#6b7280" }}>
        Preparando escala para impressão...
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif", gap: "12px" }}>
        <p style={{ color: "#374151", fontWeight: 600 }}>Escala não encontrada.</p>
        <a href={`/escalas`} style={{ color: "#059669", fontSize: "14px" }}>← Voltar para escalas</a>
      </div>
    );
  }

  const { schedule, employees, entries, occurrenceTypes, holidays } = data;
  const days = getDaysOfMonth(schedule.year, schedule.month);
  const monthTitle = getMonthName(schedule.month, schedule.year);
  const printDate = formatDate(new Date(), "dd/MM/yyyy 'às' HH:mm");

  // Group employees by sector, maintaining insertion order
  const sectorOrder: string[] = [];
  const bySector: Record<string, Employee[]> = {};
  for (const emp of employees) {
    const key = emp.sector?.id ?? "sem-setor";
    if (!bySector[key]) { bySector[key] = []; sectorOrder.push(key); }
    bySector[key].push(emp);
  }

  function getEntry(employeeId: string, dateStr: string) {
    return entries.find((e) => e.employeeId === employeeId && e.date === dateStr);
  }

  const dayTypeStyle: Record<string, { bg: string; headerBg: string; headerColor: string }> = {
    sat:     { bg: "#f1f5f9", headerBg: "#e2e8f0", headerColor: "#475569" },
    sun:     { bg: "#f1f5f9", headerBg: "#e2e8f0", headerColor: "#475569" },
    holiday: { bg: "#fffbeb", headerBg: "#fef3c7", headerColor: "#92400e" },
    normal:  { bg: "#ffffff", headerBg: "#f9fafb", headerColor: "#374151" },
  };

  const COL_W = Math.min(22, Math.floor((100 - 16) / days.length));

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #fff; }
        @media print {
          .no-print { display: none !important; }
          .print-wrapper { padding-top: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Toolbar (hidden on print) */}
      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#07104B", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          🖨 Imprimir / Salvar como PDF
        </button>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          Na janela de impressão, selecione <strong>Salvar como PDF</strong> e orientação <strong>Paisagem (A4)</strong>
        </span>
        <a href={`/escalas/${id}`} style={{ marginLeft: "auto", fontSize: "13px", color: "#6b7280", textDecoration: "none" }}>
          ← Voltar
        </a>
      </div>

      {/* Printable area */}
      <div className="print-wrapper" style={{ paddingTop: "56px" }}>

        {/* Document header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #07104B", paddingBottom: "5px", marginBottom: "6px" }}>
          <div>
            <div style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7280", fontWeight: 700 }}>
              ESSENCYAL FARMA · SISTEMA DE ESCALAS
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#07104B", marginTop: "1px", textTransform: "capitalize" }}>
              {monthTitle} {schedule.year} — {schedule.unit?.name}
            </div>
          </div>
          <div style={{ fontSize: "8px", color: "#9ca3af", textAlign: "right", lineHeight: 1.6 }}>
            Gerado em {printDate}<br />
            {employees.length} colaborador{employees.length !== 1 ? "es" : ""}
          </div>
        </div>

        {/* Schedule table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "130px" }} />
            {days.map((d) => <col key={d.toISOString()} style={{ width: `${COL_W}px` }} />)}
          </colgroup>

          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "3px 6px", background: "#f9fafb", borderBottom: "1px solid #d1d5db", fontSize: "8px", color: "#374151" }}>
                Colaborador
              </th>
              {days.map((d) => {
                const dtype = getDayType(d, holidays);
                const s = dayTypeStyle[dtype];
                return (
                  <th key={d.toISOString()} style={{ textAlign: "center", padding: "2px 0", background: s.headerBg, borderBottom: "1px solid #d1d5db", borderLeft: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 700, fontSize: "8px", color: s.headerColor }}>{d.getDate()}</div>
                    <div style={{ fontSize: "6px", fontWeight: 400, color: s.headerColor, textTransform: "uppercase" }}>
                      {getDayAbbr(d).slice(0, 3)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sectorOrder.map((sectorId) => {
              const sectorEmployees = bySector[sectorId];
              const sector = sectorEmployees[0]?.sector;
              const sectorColor = sector?.color ?? "#374151";

              return (
                <>
                  {/* Sector separator row */}
                  <tr key={`sep-${sectorId}`}>
                    <td
                      colSpan={days.length + 1}
                      style={{
                        padding: "3px 6px",
                        fontSize: "7.5px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: sectorColor,
                        background: sectorColor + "18",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      ▸ {sector?.name ?? "Sem setor"}
                    </td>
                  </tr>

                  {/* Employee rows */}
                  {sectorEmployees.map((emp, idx) => (
                    <tr key={emp.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #f3f4f6", fontSize: "8px", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}>
                        {emp.name}
                      </td>
                      {days.map((d) => {
                        const dateStr = toDateString(d);
                        const entry = getEntry(emp.id, dateStr);
                        const dtype = getDayType(d, holidays);
                        const s = dayTypeStyle[dtype];
                        const occ = entry?.occurrenceType;

                        return (
                          <td
                            key={dateStr}
                            style={{
                              textAlign: "center",
                              padding: "1px 0",
                              borderBottom: "1px solid #f3f4f6",
                              borderLeft: "1px solid #f3f4f6",
                              background: occ ? occ.bgColor : s.bg,
                            }}
                          >
                            {occ && (
                              <span style={{ fontSize: "7px", fontWeight: 700, color: occ.textColor, lineHeight: 1 }}>
                                {occ.code}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ marginTop: "7px", paddingTop: "5px", borderTop: "1px solid #e5e7eb", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "7.5px", fontWeight: 700, color: "#374151" }}>Legenda:</span>
          {occurrenceTypes.map((o) => (
            <span key={o.code} style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "7.5px", color: "#374151" }}>
              <span style={{ display: "inline-block", padding: "1px 4px", borderRadius: "3px", fontSize: "7px", fontWeight: 700, background: o.color + "22", color: o.textColor }}>
                {o.code}
              </span>
              {o.label}
            </span>
          ))}
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: "10px", fontSize: "7px", color: "#9ca3af", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", background: "#e2e8f0" }} />
              Final de semana
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", background: "#fef3c7" }} />
              Feriado
            </span>
          </span>
        </div>

      </div>
    </>
  );
}
