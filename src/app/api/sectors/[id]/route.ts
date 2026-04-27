import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const sector = await prisma.sector.findUnique({
      where: { id },
      include: { unit: true, _count: { select: { employees: { where: { active: true } } } } },
    });

    if (!sector) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sector);
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
    const { name, color, minCoverage, unitId, active } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (color !== undefined) data.color = color;
    if (minCoverage !== undefined) data.minCoverage = minCoverage;
    if (unitId !== undefined) data.unitId = unitId;
    if (active !== undefined) data.active = active;

    const sector = await prisma.sector.update({
      where: { id },
      data,
      include: { unit: true },
    });

    return NextResponse.json(sector);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.sector.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
