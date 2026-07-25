/**
 * Seed IBT — Instituto Boliviano de Tecnologia
 *
 * Crea:
 * - 1 organizacion "Instituto Boliviano de Tecnologia" (status: "active")
 * - 3 areas
 * - 6 cargos
 * - 4 usuarios
 * - 4 documentos (PEI, POA, FODA, MOF)
 *
 * Uso:
 *   npx tsx prisma/seed/seed-ibt.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const DOCS_DIR = path.join(__dirname, "docs-ibt");

async function main() {
  console.log("🌱 Seeding IBT (Instituto Boliviano de Tecnologia)...\n");

  const passwordHash = await hash("Test1234!", 12);

  // ============================================================
  // ORGANIZACION
  // ============================================================
  const orgIBT = await prisma.organization.create({
    data: {
      name: "Instituto Boliviano de Tecnologia",
      mode: "enterprise",
      status: "active",
      sector: "educacion",
      mision: "Formar profesionales competentes en tecnologia e innovacion, comprometidos con el desarrollo sostenible de Bolivia, a traves de programas academicos de excelencia y vinculacion con el sector productivo.",
      vision: "Al 2028, ser el instituto de tecnologia lider en Bolivia, reconocido por la calidad de sus egresados, la investigacion aplicada y la contribucion al ecosistema de innovacion nacional.",
      aiProvider: "none",
    },
  });

  console.log("  ✅ Organization: Instituto Boliviano de Tecnologia");

  // ============================================================
  // AREAS
  // ============================================================
  const areaAcademica = await prisma.area.create({
    data: {
      name: "Direccion Academica",
      description: "Area responsable de la gestion academica, curricula, docencia e investigacion",
      organizationId: orgIBT.id,
    },
  });

  const areaSistemas = await prisma.area.create({
    data: {
      name: "Direccion de Sistemas y Tecnologia",
      description: "Area responsable de la infraestructura tecnologica, desarrollo de sistemas y transformacion digital",
      organizationId: orgIBT.id,
    },
  });

  const areaAdmin = await prisma.area.create({
    data: {
      name: "Direccion Administrativa",
      description: "Area responsable de la gestion financiera, recursos humanos y servicios generales",
      organizationId: orgIBT.id,
    },
  });

  console.log("  ✅ 3 Areas creadas");

  // ============================================================
  // CARGOS
  // ============================================================
  const cargoRector = await prisma.cargo.create({
    data: {
      name: "Rector / Director General",
      description: "Maximo responsable de la direccion estrategica del Instituto. Representa legalmente a la institucion y preside el Consejo Academico.",
      competencias: ["Liderazgo estrategico", "Gestion educativa", "Relaciones interinstitucionales", "Planificacion", "Toma de decisiones"],
      reportsTo: "Consejo Directivo",
      organizationId: orgIBT.id,
    },
  });

  const cargoDirAcademico = await prisma.cargo.create({
    data: {
      name: "Director Academico",
      description: "Responsable del diseno y actualizacion de programas curriculares, supervision de la calidad academica y coordinacion del equipo docente.",
      competencias: ["Diseno curricular", "Gestion academica", "Evaluacion educativa", "Acreditacion", "Metodologias activas"],
      reportsTo: "Rector / Director General",
      organizationId: orgIBT.id,
      areaId: areaAcademica.id,
    },
  });

  const cargoDirSistemas = await prisma.cargo.create({
    data: {
      name: "Director de Sistemas y Tecnologia",
      description: "Planifica y ejecuta la estrategia tecnologica. Administra infraestructura TI, desarrolla sistemas y garantiza seguridad informatica.",
      competencias: ["Arquitectura de TI", "Cloud computing", "Seguridad informatica", "Gestion de proyectos", "Liderazgo tecnico"],
      reportsTo: "Rector / Director General",
      organizationId: orgIBT.id,
      areaId: areaSistemas.id,
    },
  });

  const cargoDirAdmin = await prisma.cargo.create({
    data: {
      name: "Director Administrativo",
      description: "Administra recursos financieros, gestiona contrataciones de personal y supervisa servicios generales del Instituto.",
      competencias: ["Gestion financiera", "Recursos humanos", "Planificacion presupuestaria", "Normativa educativa", "Contrataciones"],
      reportsTo: "Rector / Director General",
      organizationId: orgIBT.id,
      areaId: areaAdmin.id,
    },
  });

  const cargoJefeCarrera = await prisma.cargo.create({
    data: {
      name: "Jefe de Carrera Ing. Sistemas",
      description: "Coordina el desarrollo curricular de la carrera, asigna carga horaria y atiende a estudiantes.",
      competencias: ["Coordinacion academica", "Gestion docente", "Diseno curricular", "Atencion al estudiante"],
      reportsTo: "Director Academico",
      organizationId: orgIBT.id,
      areaId: areaAcademica.id,
    },
  });

  const cargoDocente = await prisma.cargo.create({
    data: {
      name: "Docente Tiempo Completo",
      description: "Imparte clases, disena material didactico, participa en investigacion y asesora trabajos de grado.",
      competencias: ["Docencia", "Investigacion", "Diseno instruccional", "Tutoria", "Especializacion tecnica"],
      reportsTo: "Jefe de Carrera",
      organizationId: orgIBT.id,
      areaId: areaAcademica.id,
    },
  });

  console.log("  ✅ 6 Cargos creados");

  // ============================================================
  // USUARIOS
  // ============================================================
  const userAdmin = await prisma.user.create({
    data: {
      email: "admin@ibt.edu.bo",
      name: "Dr. Fernando Quispe Mamani",
      passwordHash,
      role: "ADMIN",
      organizationId: orgIBT.id,
      cargoId: cargoRector.id,
    },
  });

  const userAcademico = await prisma.user.create({
    data: {
      email: "academico@ibt.edu.bo",
      name: "Msc. Patricia Vargas Condori",
      passwordHash,
      role: "DIRECTOR",
      organizationId: orgIBT.id,
      cargoId: cargoDirAcademico.id,
    },
  });

  const userSistemas = await prisma.user.create({
    data: {
      email: "sistemas@ibt.edu.bo",
      name: "Ing. Roberto Choque Flores",
      passwordHash,
      role: "DIRECTOR",
      organizationId: orgIBT.id,
      cargoId: cargoDirSistemas.id,
    },
  });

  const userDocente = await prisma.user.create({
    data: {
      email: "docente@ibt.edu.bo",
      name: "Lic. Maria Elena Gutierrez",
      passwordHash,
      role: "COLABORADOR",
      organizationId: orgIBT.id,
      cargoId: cargoDocente.id,
    },
  });

  console.log("  ✅ 4 Usuarios creados");

  // ============================================================
  // DOCUMENTOS
  // ============================================================
  const docs = [
    { file: "pei-ibt.md", name: "PEI 2024-2028 IBT", type: "PEI" },
    { file: "poa-ibt.md", name: "POA 2024 IBT", type: "POI" },
    { file: "foda-ibt.md", name: "FODA 2024 IBT", type: "FODA" },
    { file: "mof-ibt.md", name: "MOF IBT 2024", type: "MOF" },
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
        organizationId: orgIBT.id,
        uploadedById: userAdmin.id,
      },
    });
  }

  console.log("  ✅ 4 Documentos cargados (PEI, POA, FODA, MOF)");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEED IBT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Cuentas de prueba (password: Test1234!):\n");
  console.log("  Instituto Boliviano de Tecnologia:");
  console.log("  ├─ admin@ibt.edu.bo       → ADMIN (Rector)");
  console.log("  ├─ academico@ibt.edu.bo   → DIRECTOR (Dir. Academica)");
  console.log("  ├─ sistemas@ibt.edu.bo    → DIRECTOR (Dir. Sistemas)");
  console.log("  └─ docente@ibt.edu.bo     → COLABORADOR (Docente)");
  console.log("\n🔑 Password: Test1234!");
  console.log("📌 Status: active (empresa ya publicada)");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed IBT failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
