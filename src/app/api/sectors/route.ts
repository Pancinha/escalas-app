import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sectors = await prisma.sector.findMany({
      where: { active: true },
      include: { unit: true, _count: { select: { employees: { where: { active: true } } } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(sectors);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, color, minCoverage, unitId } = body;

    if (!name || !unitId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const sector = await prisma.sector.create({
      data: { name, color: color ?? "#059669", minCoverage: minCoverage ?? 1, unitId },
      include: { unit: true },
    });

    return NextResponse.json(sector, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
