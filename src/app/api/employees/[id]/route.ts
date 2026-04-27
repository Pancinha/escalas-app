import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { sector: true, unit: true },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, registration, sectorId, unitId, active, photoUrl } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (registration !== undefined) data.registration = registration || null;
    if (sectorId !== undefined) data.sectorId = sectorId;
    if (unitId !== undefined) data.unitId = unitId;
    if (active !== undefined) data.active = active;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { sector: true, unit: true },
    });

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.employee.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
