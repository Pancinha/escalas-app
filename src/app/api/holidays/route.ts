import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    const holidays = await prisma.holiday.findMany({
      where: year ? { date: { startsWith: year } } : undefined,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(holidays);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { date, name, type, unitId } = body;

    if (!date || !name) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const holiday = await prisma.holiday.create({
      data: { date, name, type: type ?? "NATIONAL", unitId: unitId || null },
    });

    return NextResponse.json(holiday, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
