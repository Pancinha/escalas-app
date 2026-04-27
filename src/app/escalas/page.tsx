"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Schedule } from "@/types";
import { getMonthName, statusLabel } from "@/lib/utils";
import { CalendarDays, Plus, ArrowRight, Lock, FileEdit } from "lucide-react";

const statusVariantMap: Record<string, "draft" | "published" | "locked"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  LOCKED: "locked",
};

const statusIcon: Record<string, React.ReactNode> = {
  DRAFT: <FileEdit className="h-4 w-4 text-slate-400" />,
  PUBLISHED: <CalendarDays className="h-4 w-4 text-emerald-500" />,
  LOCKED: <Lock className="h-4 w-4 text-orange-400" />,
};

export default function EscalasPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedules")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => { setSchedules(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const byYear = schedules.reduce<Record<number, Schedule[]>>((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <AppLayout>
      <Header
        title="Escalas"
        description="Gerencie as escalas mensais de trabalho"
        actions={
          <Link href="/escalas/nova">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nova escala
            </Button>
          </Link>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-16 bg-gray-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="h-14 w-14 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhuma escala criada</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Crie a primeira escala mensal para começar a gerenciar os turnos da sua equipe.
            </p>
            <Link href="/escalas/nova">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar primeira escala
              </Button>
            </Link>
          </div>
        ) : (
          years.map((year) => (
            <div key={year}>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">{year}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {byYear[year].map((schedule) => (
                  <Link key={schedule.id} href={`/escalas/${schedule.id}`}>
                    <Card className="hover:shadow-md transition-all hover:border-emerald-200 cursor-pointer group">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                            {statusIcon[schedule.status]}
                          </div>
                          <Badge variant={statusVariantMap[schedule.status] ?? "draft"}>
                            {statusLabel(schedule.status)}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {getMonthName(schedule.month, schedule.year)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{schedule.unit?.name}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            Por {schedule.createdBy?.name?.split(" ")[0]}
                          </p>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </AppLayout>
  );
}
