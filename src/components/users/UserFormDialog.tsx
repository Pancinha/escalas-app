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
import { User } from "@/types";
import { Loader2 } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user?: User;
}

const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "MANAGER", label: "Gerente" },
  { value: "VIEWER", label: "Visualizador" },
];

export function UserFormDialog({ open, onOpenChange, onSuccess, user }: UserFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setName("");
      setEmail("");
      setRole("VIEWER");
    }
    setPassword("");
    setError("");
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError("Selecione um perfil"); return; }

    setLoading(true);
    setError("");

    const body: Record<string, string> = { name, email, role };
    if (password) body.password = password;
    if (!user) {
      if (!password) { setError("Senha obrigatória para novo usuário"); setLoading(false); return; }
    }

    const url = user ? `/api/users/${user.id}` : "/api/users";
    const method = user ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
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
          <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Nome completo *</Label>
            <Input
              id="u-name"
              placeholder="Nome do usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-email">E-mail *</Label>
            <Input
              id="u-email"
              type="email"
              placeholder="usuario@essencyal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-password">
              {user ? "Nova senha (deixe em branco para não alterar)" : "Senha *"}
            </Label>
            <Input
              id="u-password"
              type="password"
              placeholder={user ? "••••••••" : "Mínimo 6 caracteres"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={password ? 6 : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Perfil *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : user ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
