import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = format(new Date(), "yyyy-MM-dd");
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [totalEmployees, activeSchedules, todayEntries, sectors] = await Promise.all([
      prisma.employee.count({ where: { active: true } }),
      prisma.schedule.count({ where: { status: { in: ["DRAFT", "PUBLISHED"] } } }),
      prisma.scheduleEntry.findMany({
        where: { date: today },
        include: { occurrenceType: true, employee: { include: { sector: true } } },
      }),
      prisma.sector.findMany({
        where: { active: true },
        include: { _count: { select: { employees: { where: { active: true } } } } },
      }),
    ]);

    const absenceEntries = todayEntries.filter((e) => e.occurrenceType?.isAbsence);
    const todayAbsences = absenceEntries.length;

    const todayCoverage = sectors.map((sector) => {
      const sectorAbsent = absenceEntries.filter(
        (e) => e.employee.sectorId === sector.id
      ).length;
      return {
        sectorName: sector.name,
        present: sector._count.employees - sectorAbsent,
        total: sector._count.employees,
        min: sector.minCoverage,
      };
    });

    const recentSchedules = await prisma.schedule.findMany({
      take: 5,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { unit: true },
    });

    return NextResponse.json({
      totalEmployees,
      activeSchedules,
      todayAbsences,
      todayCoverage,
      currentMonth,
      currentYear,
      recentSchedules,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
