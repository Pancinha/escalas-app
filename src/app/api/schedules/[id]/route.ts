import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        unit: true,
        createdBy: { select: { id: true, name: true, email: true } },
        entries: {
          include: {
            employee: { include: { sector: true } },
            occurrenceType: true,
          },
        },
      },
    });

    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(schedule);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, notes, publishedAt } = body;

    const data: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (publishedAt !== undefined) data.publishedAt = publishedAt;

    const schedule = await prisma.schedule.update({
      where: { id },
      data,
      include: { unit: true },
    });

    return NextResponse.json(schedule);
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
