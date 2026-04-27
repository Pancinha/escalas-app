/**
 * One-shot migration: copies all rows from the old Railway SQLite volume
 * (/app/data/prod.db) into the Turso (libsql://) database.
 *
 * Run from Railway terminal (after the new deploy is live):
 *   node scripts/migrate-sqlite-to-turso.mjs
 *
 * Requires env vars already set on Railway:
 *   DATABASE_URL   = libsql://...
 *   TURSO_AUTH_TOKEN
 *
 * The script is idempotent: it uses upsert so running it twice is safe.
 */

import { PrismaClient as PrismaClientRemote } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

// ── 1. Connect to old SQLite ──────────────────────────────────────────────────
const SQLITE_PATH = "/app/data/prod.db";

const sqliteClient = createClient({ url: `file:${SQLITE_PATH}` });

async function queryOld(sql, args = []) {
  const result = await sqliteClient.execute({ sql, args });
  return result.rows;
}

// ── 2. Connect to Turso ───────────────────────────────────────────────────────
const tursoUrl = process.env.DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || tursoUrl.startsWith("file:")) {
  console.error("DATABASE_URL must be a libsql:// Turso URL");
  process.exit(1);
}

const tursoAdapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
const prisma = new PrismaClientRemote({ adapter: tursoAdapter });

// ── 3. Migrate ────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Reading from: ${SQLITE_PATH}`);
  console.log(`Writing to:   ${tursoUrl}\n`);

  // Users
  const users = await queryOld("SELECT * FROM User");
  console.log(`Found ${users.length} user(s)`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        role: u.role,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
      },
    });
    console.log(`  ✓ user: ${u.email}`);
  }

  // Units
  const units = await queryOld("SELECT * FROM Unit");
  console.log(`\nFound ${units.length} unit(s)`);
  for (const u of units) {
    await prisma.unit.upsert({
      where: { id: u.id },
      update: { name: u.name },
      create: { id: u.id, name: u.name },
    });
    console.log(`  ✓ unit: ${u.name}`);
  }

  // Sectors
  const sectors = await queryOld("SELECT * FROM Sector");
  console.log(`\nFound ${sectors.length} sector(s)`);
  for (const s of sectors) {
    await prisma.sector.upsert({
      where: { id: s.id },
      update: { name: s.name, color: s.color, minCoverage: s.minCoverage, unitId: s.unitId },
      create: { id: s.id, name: s.name, color: s.color, minCoverage: s.minCoverage, unitId: s.unitId },
    });
    console.log(`  ✓ sector: ${s.name}`);
  }

  // Employees
  const employees = await queryOld("SELECT * FROM Employee");
  console.log(`\nFound ${employees.length} employee(s)`);
  for (const e of employees) {
    await prisma.employee.upsert({
      where: { registration: e.registration },
      update: { name: e.name, sectorId: e.sectorId, unitId: e.unitId, active: Boolean(e.active) },
      create: {
        id: e.id,
        name: e.name,
        registration: e.registration,
        sectorId: e.sectorId,
        unitId: e.unitId,
        active: Boolean(e.active),
      },
    });
    console.log(`  ✓ employee: ${e.name}`);
  }

  // OccurrenceTypes
  const occTypes = await queryOld("SELECT * FROM OccurrenceType");
  console.log(`\nFound ${occTypes.length} occurrence type(s)`);
  for (const o of occTypes) {
    await prisma.occurrenceType.upsert({
      where: { code: o.code },
      update: {},
      create: {
        id: o.id,
        code: o.code,
        label: o.label,
        color: o.color,
        bgColor: o.bgColor,
        textColor: o.textColor,
        isAbsence: Boolean(o.isAbsence),
        isBranchShift: Boolean(o.isBranchShift),
        isSystem: Boolean(o.isSystem),
      },
    });
    console.log(`  ✓ occurrence type: ${o.code}`);
  }

  // Holidays
  const holidays = await queryOld("SELECT * FROM Holiday");
  console.log(`\nFound ${holidays.length} holiday(s)`);
  for (const h of holidays) {
    const exists = await prisma.holiday.findFirst({ where: { date: h.date } });
    if (!exists) {
      await prisma.holiday.create({
        data: { id: h.id, date: h.date, name: h.name, type: h.type ?? "NATIONAL" },
      });
      console.log(`  ✓ holiday: ${h.name}`);
    } else {
      console.log(`  - holiday already exists: ${h.name}`);
    }
  }

  // Occurrences (employee schedule entries)
  const occurrences = await queryOld("SELECT * FROM Occurrence");
  console.log(`\nFound ${occurrences.length} occurrence(s)`);
  for (const o of occurrences) {
    const exists = await prisma.occurrence.findFirst({
      where: { employeeId: o.employeeId, date: o.date },
    });
    if (!exists) {
      await prisma.occurrence.create({
        data: {
          id: o.id,
          employeeId: o.employeeId,
          date: o.date,
          typeId: o.typeId,
          note: o.note ?? null,
        },
      });
    }
  }
  console.log(`  ✓ all occurrences migrated`);

  console.log("\n✅ Migration complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
