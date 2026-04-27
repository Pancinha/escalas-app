// Production-compatible seed script (plain ES module, no TypeScript required)
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const filePath = rawUrl.replace(/^file:/, "");
const absolutePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

const adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@essencyal.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@essencyal.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const matriz = await prisma.unit.upsert({
    where: { id: "unit-matriz" },
    update: {},
    create: { id: "unit-matriz", name: "Matriz" },
  });

  await prisma.unit.upsert({
    where: { id: "unit-filial" },
    update: {},
    create: { id: "unit-filial", name: "Filial" },
  });

  const sectorDefs = [
    { id: "sec-gestao",    name: "Gestão",    color: "#7C3AED", minCoverage: 1 },
    { id: "sec-loja",      name: "Loja",      color: "#059669", minCoverage: 2 },
    { id: "sec-call",      name: "Call",      color: "#0EA5E9", minCoverage: 1 },
    { id: "sec-expedicao", name: "Expedição", color: "#F59E0B", minCoverage: 1 },
  ];

  for (const s of sectorDefs) {
    await prisma.sector.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, unitId: matriz.id },
    });
  }

  const occurrenceDefs = [
    { code: "F",    label: "Folga",        color: "#6366F1", bgColor: "#EEF2FF", textColor: "#4338CA", isAbsence: true,  isBranchShift: false },
    { code: "A",    label: "Atestado",     color: "#EF4444", bgColor: "#FEF2F2", textColor: "#B91C1C", isAbsence: true,  isBranchShift: false },
    { code: "LK",   label: "Filial",       color: "#F59E0B", bgColor: "#FFFBEB", textColor: "#B45309", isAbsence: false, isBranchShift: true  },
    { code: "FER",  label: "Férias",       color: "#8B5CF6", bgColor: "#F5F3FF", textColor: "#6D28D9", isAbsence: true,  isBranchShift: false },
    { code: "AFT",  label: "Afastamento",  color: "#64748B", bgColor: "#F8FAFC", textColor: "#475569", isAbsence: true,  isBranchShift: false },
    { code: "TRES", label: "Treinamento",  color: "#0EA5E9", bgColor: "#F0F9FF", textColor: "#0369A1", isAbsence: false, isBranchShift: false },
  ];

  for (const o of occurrenceDefs) {
    await prisma.occurrenceType.upsert({
      where: { code: o.code },
      update: {},
      create: { ...o, isSystem: true },
    });
  }

  const employeeDefs = [
    { name: "Ana Silva",          registration: "001", sectorId: "sec-loja"      },
    { name: "Bruno Costa",        registration: "002", sectorId: "sec-loja"      },
    { name: "Carla Mendes",       registration: "003", sectorId: "sec-loja"      },
    { name: "Diego Ferreira",     registration: "004", sectorId: "sec-call"      },
    { name: "Elena Rodrigues",    registration: "005", sectorId: "sec-call"      },
    { name: "Felipe Santos",      registration: "006", sectorId: "sec-expedicao" },
    { name: "Gabriela Lima",      registration: "007", sectorId: "sec-expedicao" },
    { name: "Henrique Oliveira",  registration: "008", sectorId: "sec-gestao"    },
  ];

  for (const e of employeeDefs) {
    await prisma.employee.upsert({
      where: { registration: e.registration },
      update: {},
      create: { ...e, unitId: matriz.id },
    });
  }

  const holidays2025 = [
    { date: "2025-01-01", name: "Confraternização Universal" },
    { date: "2025-04-18", name: "Sexta-feira Santa" },
    { date: "2025-04-21", name: "Tiradentes" },
    { date: "2025-05-01", name: "Dia do Trabalhador" },
    { date: "2025-06-19", name: "Corpus Christi" },
    { date: "2025-09-07", name: "Independência do Brasil" },
    { date: "2025-10-12", name: "Nossa Senhora Aparecida" },
    { date: "2025-11-02", name: "Finados" },
    { date: "2025-11-15", name: "Proclamação da República" },
    { date: "2025-12-25", name: "Natal" },
  ];

  for (const h of holidays2025) {
    const exists = await prisma.holiday.findFirst({ where: { date: h.date } });
    if (!exists) {
      await prisma.holiday.create({ data: { ...h, type: "NATIONAL" } });
    }
  }

  console.log("\nSeed concluído com sucesso!");
  console.log("Login: admin@essencyal.com");
  console.log("Senha: admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
