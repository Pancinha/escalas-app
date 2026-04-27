import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const year = searchParams.get("year");

    const schedules = await prisma.schedule.findMany({
      where: {
        ...(unitId && { unitId }),
        ...(year && { year: parseInt(year) }),
      },
      include: { unit: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { year, month, unitId, notes } = body;

    if (!year || !month || !unitId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const existing = await prisma.schedule.findUnique({
      where: { year_month_unitId: { year, month, unitId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Escala já existe para este mês/unidade" }, { status: 409 });
    }

    const userId = session.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schedule = await prisma.schedule.create({
      data: { year, month, unitId, notes, createdById: userId },
      include: { unit: true },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
