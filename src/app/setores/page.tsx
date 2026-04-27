"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sector } from "@/types";
import { Users, ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { SectorFormDialog } from "@/components/sectors/SectorFormDialog";

export default function SetoresPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSector, setEditSector] = useState<Sector | undefined>(undefined);

  async function loadSectors() {
    setLoading(true);
    try {
      const res = await fetch("/api/sectors");
      if (res.ok) setSectors(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSectors(); }, []);

  async function handleDelete(sector: Sector) {
    if (!confirm(`Desativar setor "${sector.name}"?`)) return;
    await fetch(`/api/sectors/${sector.id}`, { method: "DELETE" });
    loadSectors();
  }

  return (
    <AppLayout>
      <Header
        title="Setores"
        description="Gerencie os setores da farmácia"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => { setEditSector(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Novo setor
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-5">
                  <div className="h-20 bg-gray-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector) => (
              <Card key={sector.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      <CardTitle className="text-base">{sector.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ backgroundColor: sector.color + "20", color: sector.color }}
                      >
                        {sector.unit?.name}
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          onClick={() => { setEditSector(sector); setDialogOpen(true); }}
                          className="rounded p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sector)}
                          className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Colaboradores</p>
                        <p className="text-lg font-bold text-gray-900">
                          {sector._count?.employees ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cobertura mínima</p>
                        <p className="text-lg font-bold text-gray-900">{sector.minCoverage}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <SectorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadSectors}
        sector={editSector}
      />
    </AppLayout>
  );
}
