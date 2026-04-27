"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMonthName, statusLabel } from "@/lib/utils";
import {
  Users,
  CalendarDays,
  AlertTriangle,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardData {
  totalEmployees: number;
  activeSchedules: number;
  todayAbsences: number;
  todayCoverage: { sectorName: string; present: number; total: number; min: number }[];
  currentMonth: number;
  currentYear: number;
  recentSchedules: {
    id: string;
    year: number;
    month: number;
    status: string;
    unit: { name: string };
  }[];
}

const statusVariant: Record<string, "draft" | "published" | "locked"> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  LOCKED: "locked",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const stats = data
    ? [
        {
          label: "Colaboradores ativos",
          value: data.totalEmployees,
          icon: Users,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Escalas abertas",
          value: data.activeSchedules,
          icon: CalendarDays,
          color: "text-sky-600",
          bg: "bg-sky-50",
        },
        {
          label: "Ausências hoje",
          value: data.todayAbsences,
          icon: AlertTriangle,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Setores monitorados",
          value: data.todayCoverage.length,
          icon: Building2,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
      ]
    : [];

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        description={today.charAt(0).toUpperCase() + today.slice(1)}
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
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {!data
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-5">
                    <div className="h-14 bg-gray-100 rounded-lg" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                          <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coverage */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Cobertura dos setores hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {!data ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : data.todayCoverage.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  Nenhum dado de cobertura disponível
                </p>
              ) : (
                <div className="space-y-3">
                  {data.todayCoverage.map((c) => {
                    const ok = c.present >= c.min;
                    const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                    return (
                      <div key={c.sectorName} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {c.sectorName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {ok ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                              <span className={`text-xs font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                                {c.present}/{c.total}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className={`h-1.5 rounded-full transition-all ${ok ? "bg-emerald-500" : "bg-red-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent schedules */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Escalas recentes</CardTitle>
              <Link href="/escalas">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!data ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : data.recentSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma escala criada ainda</p>
                  <Link href="/escalas/nova" className="mt-3">
                    <Button size="sm" variant="outline">Criar primeira escala</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentSchedules.map((s) => (
                    <Link key={s.id} href={`/escalas/${s.id}`}>
                      <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                            <CalendarDays className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {getMonthName(s.month, s.year)} {s.year}
                            </p>
                            <p className="text-xs text-gray-500">{s.unit.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant[s.status] ?? "draft"}>
                            {statusLabel(s.status)}
                          </Badge>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Acesso rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { href: "/escalas/nova", label: "Nova Escala", icon: CalendarDays, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
                { href: "/funcionarios", label: "Funcionários", icon: Users, color: "text-sky-600 bg-sky-50 hover:bg-sky-100" },
                { href: "/setores", label: "Setores", icon: Building2, color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
                { href: "/configuracoes", label: "Configurações", icon: TrendingUp, color: "text-amber-600 bg-amber-50 hover:bg-amber-100" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors cursor-pointer ${action.color}`}>
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
