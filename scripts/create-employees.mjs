import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL ?? "file:./dev.db";

let adapter;
if (!url.startsWith("file:")) {
  adapter = new PrismaLibSql({ url, authToken: process.env.TURSO_AUTH_TOKEN });
} else {
  const filePath = url.replace(/^file:/, "");
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
}

const prisma = new PrismaClient({ adapter });

const employees = [
  // GESTÃO
  { registration: "001", name: "Lisiane",   sectorId: "sec-gestao"    },
  { registration: "002", name: "Patrícia",  sectorId: "sec-gestao"    },
  { registration: "003", name: "Thamires",  sectorId: "sec-gestao"    },
  // LOJA
  { registration: "004", name: "Carla",     sectorId: "sec-loja"      },
  { registration: "005", name: "Cibele",    sectorId: "sec-loja"      },
  { registration: "006", name: "Daniela",   sectorId: "sec-loja"      },
  { registration: "007", name: "Leodenir",  sectorId: "sec-loja"      },
  { registration: "008", name: "Larissa",   sectorId: "sec-loja"      },
  // CALL
  { registration: "009", name: "Julia",     sectorId: "sec-call"      },
  { registration: "010", name: "Kethellyn", sectorId: "sec-call"      },
  { registration: "011", name: "Benites",   sectorId: "sec-call"      },
  { registration: "012", name: "Phelipe",   sectorId: "sec-call"      },
  { registration: "013", name: "Ashley",    sectorId: "sec-call"      },
  { registration: "014", name: "Katia",     sectorId: "sec-call"      },
  { registration: "015", name: "Tauana",    sectorId: "sec-call"      },
  { registration: "016", name: "Kamilli",   sectorId: "sec-call"      },
  { registration: "017", name: "Franciele", sectorId: "sec-call"      },
  // EXPEDIÇÃO
  { registration: "018", name: "Silvana",   sectorId: "sec-expedicao" },
  { registration: "019", name: "Alejandro", sectorId: "sec-expedicao" },
  { registration: "020", name: "Felipe",    sectorId: "sec-expedicao" },
];

async function main() {
  console.log("Criando funcionários...\n");

  for (const e of employees) {
    await prisma.employee.upsert({
      where: { registration: e.registration },
      update: { name: e.name, sectorId: e.sectorId },
      create: { ...e, unitId: "unit-matriz" },
    });
    console.log(`✓ [${e.registration}] ${e.name} — ${e.sectorId}`);
  }

  const total = await prisma.employee.count();
  console.log(`\n✅ Concluído! Total de funcionários no banco: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
