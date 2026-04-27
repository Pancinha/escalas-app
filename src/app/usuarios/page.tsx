"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";
import { getInitials } from "@/lib/utils";
import { Plus, Pencil, UserX, ShieldCheck, Eye, Users } from "lucide-react";
import { UserFormDialog } from "@/components/users/UserFormDialog";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "#7C3AED" },
  MANAGER: { label: "Gerente", color: "#0EA5E9" },
  VIEWER: { label: "Visualizador", color: "#059669" },
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleDeactivate(user: User) {
    if (!confirm(`Desativar o usuário ${user.name}?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) loadUsers();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Erro ao desativar");
    }
  }

  async function handleReactivate(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    if (res.ok) loadUsers();
  }

  if (forbidden) {
    return (
      <AppLayout>
        <Header title="Usuários" description="Gerenciamento de acesso ao sistema" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Acesso restrito</p>
            <p className="text-sm text-gray-400 mt-1">Apenas administradores podem gerenciar usuários</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  const active = users.filter((u) => u.active);
  const inactive = users.filter((u) => !u.active);

  return (
    <AppLayout>
      <Header
        title="Usuários"
        description={`${active.length} usuário${active.length !== 1 ? "s" : ""} ativo${active.length !== 1 ? "s" : ""}`}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setEditUser(undefined); setDialogOpen(true); }}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo usuário
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-4 pb-4">
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Active users */}
            <section className="space-y-3">
              {active.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Nenhum usuário encontrado</p>
                  <p className="text-sm text-gray-400 mt-1">Crie o primeiro usuário clicando em "Novo usuário"</p>
                </div>
              ) : (
                active.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEdit={(u) => { setEditUser(u); setDialogOpen(true); }}
                    onDeactivate={handleDeactivate}
                    onReactivate={handleReactivate}
                  />
                ))
              )}
            </section>

            {/* Inactive users */}
            {inactive.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Desativados ({inactive.length})
                </p>
                <div className="space-y-2">
                  {inactive.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={(u) => { setEditUser(u); setDialogOpen(true); }}
                      onDeactivate={handleDeactivate}
                      onReactivate={handleReactivate}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadUsers}
        user={editUser}
      />
    </AppLayout>
  );
}

function RoleIcon({ role }: { role: string }) {
  if (role === "ADMIN") return <ShieldCheck className="h-3.5 w-3.5" />;
  if (role === "MANAGER") return <Users className="h-3.5 w-3.5" />;
  return <Eye className="h-3.5 w-3.5" />;
}

function UserCard({
  user,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDeactivate: (u: User) => void;
  onReactivate: (u: User) => void;
}) {
  const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: "#6B7280" };

  return (
    <Card className={`transition-shadow group ${!user.active ? "opacity-50" : "hover:shadow-md"}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className="text-sm font-semibold"
              style={{
                backgroundColor: roleInfo.color + "20",
                color: roleInfo.color,
              }}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              {!user.active && (
                <span className="text-xs text-gray-400 font-normal">(desativado)</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: roleInfo.color + "18", color: roleInfo.color }}
            >
              <RoleIcon role={user.role} />
              {roleInfo.label}
            </span>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {user.active ? (
                <>
                  <button
                    onClick={() => onEdit(user)}
                    className="rounded p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeactivate(user)}
                    className="rounded p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Desativar"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onReactivate(user)}
                  className="rounded px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
                  title="Reativar"
                >
                  Reativar
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
