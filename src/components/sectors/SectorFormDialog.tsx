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
import { Sector, Unit } from "@/types";
import { Loader2 } from "lucide-react";

const PRESET_COLORS = [
  "#059669", "#0EA5E9", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#F97316",
];

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sector?: Sector;
}

export function SectorFormDialog({ open, onOpenChange, onSuccess, sector }: SectorFormDialogProps) {
  const [name, setName] = useState(sector?.name ?? "");
  const [color, setColor] = useState(sector?.color ?? "#059669");
  const [minCoverage, setMinCoverage] = useState(String(sector?.minCoverage ?? 1));
  const [unitId, setUnitId] = useState(sector?.unitId ?? "");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/units")
      .then((r) => r.json())
      .then((data: Unit[]) => {
        setUnits(data);
        if (!sector && data.length > 0) setUnitId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (sector) {
      setName(sector.name);
      setColor(sector.color);
      setMinCoverage(String(sector.minCoverage));
      setUnitId(sector.unitId);
    } else {
      setName("");
      setColor("#059669");
      setMinCoverage("1");
    }
    setError("");
  }, [sector, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = { name, color, minCoverage: parseInt(minCoverage), unitId };
    const url = sector ? `/api/sectors/${sector.id}` : "/api/sectors";
    const method = sector ? "PUT" : "POST";

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
          <DialogTitle>{sector ? "Editar setor" : "Novo setor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sector-name">Nome do setor *</Label>
            <Input
              id="sector-name"
              placeholder="Ex: Gestão, Loja, Expedição..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-7 rounded-full cursor-pointer border-0"
                title="Cor personalizada"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="min-coverage">Cobertura mínima *</Label>
            <Input
              id="min-coverage"
              type="number"
              min={1}
              max={50}
              value={minCoverage}
              onChange={(e) => setMinCoverage(e.target.value)}
              required
            />
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : sector ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
