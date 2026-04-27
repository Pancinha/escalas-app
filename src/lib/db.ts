import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  // Remote Turso/LibSQL database
  if (!url.startsWith("file:")) {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    const adapter = new PrismaLibSql({ url, authToken } as ConstructorParameters<typeof PrismaLibSql>[0]);
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  // Local SQLite file — resolve to absolute path
  const filePath = url.replace("file:", "");
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
