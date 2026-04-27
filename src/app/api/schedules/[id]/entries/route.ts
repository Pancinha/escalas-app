import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const entries = await prisma.scheduleEntry.findMany({
      where: { scheduleId: id },
      include: {
        employee: { include: { sector: true } },
        occurrenceType: true,
      },
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: scheduleId } = await params;
    const body = await req.json();
    const { employeeId, date, occurrenceTypeId, note } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const entry = await prisma.scheduleEntry.upsert({
      where: {
        scheduleId_employeeId_date: { scheduleId, employeeId, date },
      },
      create: { scheduleId, employeeId, date, occurrenceTypeId: occurrenceTypeId || null, note },
      update: { occurrenceTypeId: occurrenceTypeId || null, note, updatedAt: new Date() },
      include: { occurrenceType: true },
    });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: scheduleId } = await params;
    const body = await req.json();
    const { employeeId, date } = body;

    await prisma.scheduleEntry.deleteMany({
      where: { scheduleId, employeeId, date },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
