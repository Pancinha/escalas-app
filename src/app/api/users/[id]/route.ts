import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionRole = (session.user as { role?: string }).role;
    if (sessionRole !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, active } = body;

    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Formato de e-mail inválido" }, { status: 400 });
    }

    const validRoles = ["ADMIN", "MANAGER", "VIEWER"];
    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = active;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "A senha deve ter no mínimo 6 caracteres" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    if (email !== undefined) {
      const conflict = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (conflict) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionRole = (session.user as { role?: string }).role;
    if (sessionRole !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const sessionId = (session.user as { id?: string }).id;
    if (id === sessionId) {
      return NextResponse.json({ error: "Não é possível desativar a sua própria conta" }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
