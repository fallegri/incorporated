/**
 * Database Seed Script — Datos de prueba para Incorporated
 *
 * Crea:
 * - 1 organización modo Empresa (TechNova) con estructura completa
 * - 1 organización modo Individual (freelance)
 * - Usuarios con diferentes roles
 * - Áreas y cargos con descripciones
 * - Documentos pre-cargados (PEI, FODA, MOF, POA)
 *
 * Uso:
 *   npx ts-node prisma/seed/seed.ts
 *   o
 *   npx tsx prisma/seed/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const DOCS_DIR = path.join(__dirname, "docs");

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============================================================
  // 1. MODO EMPRESA — TechNova S.A.
  // ============================================================
  console.log("🏢 Creating enterprise organization: TechNova S.A.");

  const orgEmpresa = await prisma.organization.create({
    data: {
      name: "Corporación TechNova S.A.",
      mode: "enterprise",
      status: "active",
      aiProvider: "none",
    },
  });

  // Areas
  const areaTecnologia = await prisma.area.create({
    data: { name: "Dirección de Tecnología", organizationId: orgEmpresa.id },
  });
  const areaComercial = await prisma.area.create({
    data: { name: "Dirección Comercial", organizationId: orgEmpresa.id },
  });
  const areaRRHH = await prisma.area.create({
    data: { name: "Direccion de Desarrollo Humano", organizationId: orgEmpresa.id },
  });
  const areaAdmin = await prisma.area.create({
    data: { name: "Dirección de Administración y Finanzas", organizationId: orgEmpresa.id },
  });

  // Sub-areas
  const areaDesarrollo = await prisma.area.create({
    data: { name: "Jefatura de Desarrollo de Software", organizationId: orgEmpresa.id, parentId: areaTecnologia.id },
  });
  const areaMarketing = await prisma.area.create({
    data: { name: "Jefatura de Marketing Digital", organizationId: orgEmpresa.id, parentId: areaComercial.id },
  });

  // Cargos
  const cargoJefeDesarrollo = await prisma.cargo.create({
    data: {
      name: "Jefe de Desarrollo de Software",
      description: "Liderar el equipo de desarrollo garantizando entregas con calidad, dentro del presupuesto y plazos.",
      competencias: ["Liderazgo técnico", "Arquitectura de software", "Scrum", "Comunicación", "Resolución de conflictos"],
      reportsTo: "Director de Tecnología (CTO)",
      organizationId: orgEmpresa.id,
      areaId: areaDesarrollo.id,
    },
  });

  const cargoJefeMarketing = await prisma.cargo.create({
    data: {
      name: "Jefe de Marketing Digital",
      description: "Diseñar y ejecutar la estrategia de marketing digital que posicione a TechNova como referente.",
      competencias: ["Marketing digital", "Análisis de datos", "Gestión de presupuestos", "Creatividad", "Liderazgo"],
      reportsTo: "Director Comercial",
      organizationId: orgEmpresa.id,
      areaId: areaMarketing.id,
    },
  });

  const cargoAnalistaOD = await prisma.cargo.create({
    data: {
      name: "Analista de Desarrollo Organizacional",
      description: "Diseñar programas de desarrollo organizacional que fortalezcan cultura y desempeño.",
      competencias: ["Gestión del talento", "Diseño instruccional", "Análisis organizacional", "Comunicación"],
      reportsTo: "Director de Desarrollo Humano",
      organizationId: orgEmpresa.id,
      areaId: areaRRHH.id,
    },
  });

  const cargoGerente = await prisma.cargo.create({
    data: {
      name: "Gerente General",
      description: "Liderar la dirección estratégica de TechNova, coordinando todas las áreas.",
      competencias: ["Liderazgo estratégico", "Visión de negocio", "Toma de decisiones", "Gestión financiera"],
      reportsTo: "Directorio",
      organizationId: orgEmpresa.id,
    },
  });

  // Users (password: Test1234!)
  const passwordHash = await hash("Test1234!", 12);

  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@technova.com",
      name: "Carlos Mendoza",
      passwordHash,
      role: "ADMIN",
      organizationId: orgEmpresa.id,
      cargoId: cargoGerente.id,
    },
  });

  const userJefeDev = await prisma.user.create({
    data: {
      email: "jefe.dev@technova.com",
      name: "Ana García",
      passwordHash,
      role: "JEFE_AREA",
      organizationId: orgEmpresa.id,
      cargoId: cargoJefeDesarrollo.id,
    },
  });

  const userJefeMkt = await prisma.user.create({
    data: {
      email: "jefe.marketing@technova.com",
      name: "Roberto Flores",
      passwordHash,
      role: "JEFE_AREA",
      organizationId: orgEmpresa.id,
      cargoId: cargoJefeMarketing.id,
    },
  });

  const userAnalista = await prisma.user.create({
    data: {
      email: "analista.dh@technova.com",
      name: "Maria Lopez",
      passwordHash,
      role: "COLABORADOR",
      organizationId: orgEmpresa.id,
      cargoId: cargoAnalistaOD.id,
    },
  });

  // Load documents
  const docs = [
    { file: "pei-empresa.md", name: "PEI 2024-2028 TechNova", type: "PEI" },
    { file: "foda-empresa.md", name: "FODA TechNova 2024", type: "FODA" },
    { file: "mof-empresa.md", name: "MOF TechNova 2024", type: "MOF" },
    { file: "poa-empresa.md", name: "POA TechNova 2024", type: "POI" },
    { file: "organigrama-empresa.md", name: "Organigrama TechNova 2024", type: "OTRO" },
  ];

  for (const doc of docs) {
    const content = fs.readFileSync(path.join(DOCS_DIR, doc.file), "utf-8");
    await prisma.document.create({
      data: {
        name: doc.name,
        type: doc.type as any,
        format: "MD",
        rawText: content,
        status: "READY",
        organizationId: orgEmpresa.id,
        uploadedById: userAdmin.id,
      },
    });
  }

  console.log("  ✅ Organization: TechNova S.A.");
  console.log("  ✅ 4 Areas + 2 Sub-areas");
  console.log("  ✅ 4 Cargos");
  console.log("  ✅ 4 Users");
  console.log("  ✅ 5 Documents (PEI, FODA, MOF, POA, Organigrama)");

  // ============================================================
  // 2. MODO INDIVIDUAL — Freelance
  // ============================================================
  console.log("\n👤 Creating individual user: Freelance Consultant");

  const orgIndividual = await prisma.organization.create({
    data: {
      name: "Consultoría Diego Paredes",
      mode: "individual",
      status: "active",
      aiProvider: "none",
    },
  });

  const cargoFreelance = await prisma.cargo.create({
    data: {
      name: "Ejecutivo de Cuenta (Freelance)",
      description: "Gestionar relación con clientes, identificar oportunidades de venta, coordinar servicios.",
      competencias: ["Ventas consultivas B2B", "Negociación", "CRM", "Comunicación ejecutiva"],
      reportsTo: "Clientes directos",
      organizationId: orgIndividual.id,
    },
  });

  const userIndividual = await prisma.user.create({
    data: {
      email: "diego@freelance.com",
      name: "Diego Paredes",
      passwordHash,
      role: "INDIVIDUAL",
      organizationId: orgIndividual.id,
      cargoId: cargoFreelance.id,
    },
  });

  // Individual user has their own simplified docs
  await prisma.document.create({
    data: {
      name: "Mi Plan de Negocio 2024",
      type: "PEI",
      format: "TEXT",
      rawText: `# Plan de Negocio — Diego Paredes, Consultor Tecnológico

## Misión
Ayudar a empresas medianas a adoptar tecnología de forma efectiva.

## Objetivos 2024
- Conseguir 10 clientes recurrentes
- Facturar $80,000 USD anuales
- Especializarme en soluciones de IA para empresas
- Obtener certificación AWS Solutions Architect

## Servicios
- Consultoría en transformación digital
- Implementación de herramientas cloud
- Asesoría en adopción de IA
- Capacitación técnica a equipos

## KPIs personales
- Clientes activos: Meta ≥ 10
- Facturación mensual: Meta ≥ $6,500 USD
- NPS clientes: Meta ≥ 9.0
- Horas facturables/mes: Meta ≥ 120h
`,
      status: "READY",
      organizationId: orgIndividual.id,
      uploadedById: userIndividual.id,
    },
  });

  console.log("  ✅ Individual org created");
  console.log("  ✅ 1 Cargo (Freelance)");
  console.log("  ✅ 1 User (Diego)");
  console.log("  ✅ 1 Document (Plan de Negocio)");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEED COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Test accounts (password: Test1234!):\n");
  console.log("  MODO EMPRESA (TechNova S.A.):");
  console.log("  ├─ admin@technova.com        → ADMIN (Gerente General)");
  console.log("  ├─ jefe.dev@technova.com     → JEFE_AREA (Jefe Desarrollo)");
  console.log("  ├─ jefe.marketing@technova.com → JEFE_AREA (Jefe Marketing)");
  console.log("  ├─ analista.dh@technova.com   → COLABORADOR (Analista Desarrollo Humano)");
  console.log("");
  console.log("  MODO INDIVIDUAL:");
  console.log("  └─ diego@freelance.com       → INDIVIDUAL (Freelance)");
  console.log("\n🔑 Password para todos: Test1234!");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
