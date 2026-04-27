import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sectorId = searchParams.get("sectorId");
    const unitId = searchParams.get("unitId");
    const active = searchParams.get("active");

    const employees = await prisma.employee.findMany({
      where: {
        ...(sectorId && { sectorId }),
        ...(unitId && { unitId }),
        ...(active !== null && { active: active === "true" }),
      },
      include: { sector: true, unit: true },
      orderBy: [{ sector: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json(employees);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, registration, sectorId, unitId } = body;

    if (!name || !sectorId || !unitId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    if (registration) {
      const dup = await prisma.employee.findUnique({ where: { registration } });
      if (dup) return NextResponse.json({ error: "Matrícula já cadastrada" }, { status: 409 });
    }

    const employee = await prisma.employee.create({
      data: { name, registration: registration || null, sectorId, unitId },
      include: { sector: true, unit: true },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
