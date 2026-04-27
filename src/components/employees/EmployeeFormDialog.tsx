"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, Sector, Unit } from "@/types";
import { Loader2 } from "lucide-react";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sectors: Sector[];
  employee?: Employee;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  onSuccess,
  sectors,
  employee,
}: EmployeeFormDialogProps) {
  const [name, setName] = useState(employee?.name ?? "");
  const [registration, setRegistration] = useState(employee?.registration ?? "");
  const [sectorId, setSectorId] = useState(employee?.sectorId ?? "");
  const [unitId, setUnitId] = useState(employee?.unitId ?? "");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/units")
      .then((r) => r.json())
      .then(setUnits);
  }, []);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRegistration(employee.registration ?? "");
      setSectorId(employee.sectorId);
      setUnitId(employee.unitId);
    } else {
      setName("");
      setRegistration("");
      setSectorId("");
      setUnitId("");
    }
  }, [employee, open]);

  // Auto-select first unit when units load and none is selected yet
  useEffect(() => {
    if (!employee && units.length > 0 && !unitId) {
      setUnitId(units[0].id);
    }
  }, [units]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = { name, registration: registration || undefined, sectorId, unitId };
    const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
    const method = employee ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Erro ao salvar");
    } else {
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar funcionário" : "Novo funcionário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="Nome do colaborador"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="registration">Matrícula</Label>
            <Input
              id="registration"
              placeholder="Ex: 001"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Setor *</Label>
            <Select value={sectorId} onValueChange={setSectorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Unidade *</Label>
            <Select value={unitId} onValueChange={setUnitId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : employee ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
