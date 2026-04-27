"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Employee, Sector } from "@/types";
import { getInitials } from "@/lib/utils";
import { Plus, Search, Users, Building2, Pencil, Trash2 } from "lucide-react";
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | undefined>(undefined);

  async function loadData() {
    setLoading(true);
    try {
      const [empRes, secRes] = await Promise.all([
        fetch("/api/employees?active=true"),
        fetch("/api/sectors"),
      ]);
      if (empRes.ok) setEmployees(await empRes.json());
      if (secRes.ok) setSectors(await secRes.json());
    } catch {
      // silently fail — page shows empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === "all" || e.sectorId === sectorFilter;
    return matchSearch && matchSector;
  });

  const bySector = sectors.map((s) => ({
    ...s,
    employees: filtered.filter((e) => e.sectorId === s.id),
  })).filter((s) => s.employees.length > 0 || sectorFilter === "all");

  return (
    <AppLayout>
      <Header
        title="Funcionários"
        description={`${employees.length} colaboradores ativos`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => { setEditEmployee(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Novo funcionário
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-16 bg-gray-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Nenhum funcionário encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou adicionar um novo colaborador</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sectorFilter === "all" ? (
              bySector.map((sector) => (
                <div key={sector.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sector.color }} />
                    <h2 className="text-sm font-semibold text-gray-700">{sector.name}</h2>
                    <span className="text-xs text-gray-400">({sector.employees.length})</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sector.employees.map((emp) => (
                      <EmployeeCard key={emp.id} employee={emp} onUpdate={loadData} onEdit={(e) => { setEditEmployee(e); setDialogOpen(true); }} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((emp) => (
                  <EmployeeCard key={emp.id} employee={emp} onUpdate={loadData} onEdit={(e) => { setEditEmployee(e); setDialogOpen(true); }} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadData}
        sectors={sectors}
        employee={editEmployee}
      />
    </AppLayout>
  );
}

function EmployeeCard({
  employee,
  onUpdate,
  onEdit,
}: {
  employee: Employee;
  onUpdate: () => void;
  onEdit: (e: Employee) => void;
}) {
  async function handleDelete() {
    if (!confirm(`Desativar ${employee.name}?`)) return;
    await fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
    onUpdate();
  }

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className="text-sm font-semibold"
              style={{
                backgroundColor: employee.sector?.color + "20",
                color: employee.sector?.color,
              }}
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
              {employee.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{employee.sector?.name}</span>
            </div>
            {employee.registration && (
              <p className="text-xs text-gray-400 mt-0.5">Matr. {employee.registration}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(employee)}
              className="rounded p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Desativar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
