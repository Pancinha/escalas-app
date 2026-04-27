"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Holiday, OccurrenceType } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, CalendarX, Tag, X } from "lucide-react";

export default function ConfiguracoesPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [occTypes, setOccTypes] = useState<OccurrenceType[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/holidays").then((r) => r.json()),
      fetch("/api/occurrence-types").then((r) => r.json()),
    ]).then(([h, o]) => {
      setHolidays(h);
      setOccTypes(o);
    });
  }, []);

  async function addHoliday() {
    if (!newDate || !newName) return;
    setSaving(true);
    const res = await fetch("/api/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, name: newName }),
    });
    if (res.ok) {
      const h: Holiday = await res.json();
      setHolidays((prev) => [...prev, h].sort((a, b) => a.date.localeCompare(b.date)));
      setNewDate("");
      setNewName("");
    }
    setSaving(false);
  }

  async function deleteHoliday(id: string) {
    await fetch(`/api/holidays/${id}`, { method: "DELETE" });
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <AppLayout>
      <Header title="Configurações" description="Gerencie feriados e tipos de ocorrência" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
        {/* Holidays */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base">Feriados</CardTitle>
              </div>
              <span className="text-xs text-gray-400">{holidays.length} cadastrados</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add form */}
            <div className="flex gap-3">
              <div className="w-44">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Nome do feriado"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button onClick={addHoliday} size="sm" disabled={saving || !newDate || !newName}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 w-24">
                      {formatDate(h.date)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor:
                          h.type === "NATIONAL" ? "#FEF9C3" : "#F0F9FF",
                        color: h.type === "NATIONAL" ? "#A16207" : "#0369A1",
                      }}
                    >
                      {h.type === "NATIONAL" ? "Nacional" : "Local"}
                    </span>
                    <button
                      onClick={() => deleteHoliday(h.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {holidays.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nenhum feriado cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Occurrence Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base">Tipos de ocorrência</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {occTypes.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl p-3 border"
                  style={{ borderColor: o.color + "33", backgroundColor: o.bgColor }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-lg px-2.5 py-1 text-xs font-bold"
                      style={{ backgroundColor: o.color + "22", color: o.textColor }}
                    >
                      {o.code}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.label}</p>
                      <p className="text-xs text-gray-500">
                        {o.isAbsence && "Contabiliza ausência · "}
                        {o.isBranchShift && "Turno na filial · "}
                        {o.isSystem ? "Sistema" : "Personalizado"}
                      </p>
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: o.color }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
