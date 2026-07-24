/**
 * Seed: Datos de múltiples gestiones para comparativa
 * Agrega objetivos de gestión 2023 (ya completados) para el user admin
 *
 * Uso: npx tsx prisma/seed/seed-gestiones.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding gestiones data...\n");

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@technova.com" },
    include: { organization: true },
  });

  if (!admin) {
    console.log("❌ Run the main seed first (seed.ts)");
    return;
  }

  // Get or create cargo for admin
  let cargoId = admin.cargoId;
  if (!cargoId) {
    const cargo = await prisma.cargo.findFirst({
      where: { organizationId: admin.organizationId! },
    });
    cargoId = cargo?.id;
  }

  if (!cargoId) {
    console.log("❌ No cargo found for admin");
    return;
  }

  // ============================================================
  // GESTIÓN 2023 — Objetivos completados/parciales
  // ============================================================
  console.log("📅 Creating Gestión 2023 data...");

  const objetivos2023 = [
    {
      titulo: "Incrementar ingresos por servicios en un 20%",
      descripcion: "Meta: $2.0M USD. Resultado: $1.85M (92.5%)",
      tipo: "ESTRATEGICO" as const,
      estado: "COMPLETADO" as const,
      gestion: "2023",
      alineamientoPei: "OE-05: Garantizar sostenibilidad financiera",
      actividades: [
        { descripcion: "Contratar 2 ejecutivos de cuenta", estado: "terminado", plazo: "30" },
        { descripcion: "Lanzar programa de referidos", estado: "terminado", plazo: "60" },
        { descripcion: "Participar en 3 eventos del sector", estado: "terminado", plazo: "90" },
        { descripcion: "Abrir canal de ventas en Colombia", estado: "en_curso", plazo: "90" },
      ],
      kpis: [
        { nombre: "Ingresos anuales", metrica: "USD facturados", meta: "$2.0M", valorActual: "$1.85M" },
        { nombre: "Clientes nuevos", metrica: "Cantidad clientes firmados", meta: "20", valorActual: "18" },
      ],
    },
    {
      titulo: "Consolidar equipo técnico",
      descripcion: "Contratar 15 desarrolladores, retención 80%",
      tipo: "ESTRATEGICO" as const,
      estado: "COMPLETADO" as const,
      gestion: "2023",
      alineamientoPei: "OE-03: Fortalecer desarrollo profesional",
      actividades: [
        { descripcion: "Publicar 15 ofertas en plataformas tech", estado: "terminado", plazo: "30" },
        { descripcion: "Implementar programa de onboarding básico", estado: "terminado", plazo: "60" },
        { descripcion: "Crear plan de bonos por permanencia", estado: "terminado", plazo: "60" },
        { descripcion: "Implementar evaluación trimestral", estado: "terminado", plazo: "90" },
      ],
      kpis: [
        { nombre: "Contrataciones", metrica: "Desarrolladores contratados", meta: "15", valorActual: "12" },
        { nombre: "Retención anual", metrica: "% personal que permanece", meta: "80%", valorActual: "78%" },
      ],
    },
    {
      titulo: "Implementar metodologías ágiles en 100% de proyectos",
      descripcion: "Migrar todos los proyectos a Scrum/Kanban",
      tipo: "OPERATIVO" as const,
      estado: "COMPLETADO" as const,
      gestion: "2023",
      alineamientoPei: "OE-02: Consolidar calidad de servicios",
      actividades: [
        { descripcion: "Capacitar a líderes en Scrum (certificación)", estado: "terminado", plazo: "30" },
        { descripcion: "Migrar 5 proyectos legacy a Scrum", estado: "terminado", plazo: "60" },
        { descripcion: "Implementar herramientas (Jira/Linear)", estado: "terminado", plazo: "30" },
        { descripcion: "Establecer ceremonias ágiles estándar", estado: "terminado", plazo: "60" },
        { descripcion: "Migrar proyectos restantes", estado: "en_curso", plazo: "90" },
      ],
      kpis: [
        { nombre: "Cobertura ágil", metrica: "% proyectos con Scrum", meta: "100%", valorActual: "85%" },
        { nombre: "Velocidad sprint", metrica: "Story points/sprint", meta: "40", valorActual: "38" },
      ],
    },
    {
      titulo: "Reducir tiempo promedio de entrega de proyectos",
      descripcion: "De 60 días a 45 días promedio",
      tipo: "OPERATIVO" as const,
      estado: "COMPLETADO" as const,
      gestion: "2023",
      alineamientoPei: "OE-02: Consolidar calidad de servicios",
      actividades: [
        { descripcion: "Implementar CI/CD en proyectos principales", estado: "terminado", plazo: "30" },
        { descripcion: "Crear templates de proyecto estandarizados", estado: "terminado", plazo: "60" },
        { descripcion: "Automatizar testing (cobertura 70%)", estado: "terminado", plazo: "90" },
      ],
      kpis: [
        { nombre: "Tiempo de entrega", metrica: "Días promedio por proyecto", meta: "45 días", valorActual: "48 días" },
        { nombre: "Proyectos en plazo", metrica: "% entregados a tiempo", meta: "80%", valorActual: "75%" },
      ],
    },
  ];

  for (const obj of objetivos2023) {
    const objetivo = await prisma.objetivo.create({
      data: {
        titulo: obj.titulo,
        descripcion: obj.descripcion,
        tipo: obj.tipo,
        estado: obj.estado,
        gestion: obj.gestion,
        alineamientoPei: obj.alineamientoPei,
        generadoPorIA: false,
        cargoId,
        userId: admin.id,
      },
    });

    for (const act of obj.actividades) {
      await prisma.actividad.create({
        data: {
          descripcion: act.descripcion,
          plazoDias: act.plazo,
          prioridad: "alta",
          estado: act.estado,
          completada: act.estado === "terminado",
          completadaAt: act.estado === "terminado" ? new Date("2023-12-15") : null,
          objetivoId: objetivo.id,
        },
      });
    }

    for (const kpi of obj.kpis) {
      await prisma.kPI.create({
        data: {
          nombre: kpi.nombre,
          metrica: kpi.metrica,
          meta: kpi.meta,
          valorActual: kpi.valorActual,
          frecuencia: "anual",
          objetivoId: objetivo.id,
        },
      });
    }
  }

  // ============================================================
  // GESTIÓN 2024 — Objetivos en progreso
  // ============================================================
  console.log("📅 Creating Gestión 2024 data...");

  const objetivos2024 = [
    {
      titulo: "Incrementar ingresos por servicios en un 25%",
      descripcion: "Meta: $2.5M USD (vs $1.85M logrado en 2023)",
      tipo: "ESTRATEGICO" as const,
      estado: "EN_PROGRESO" as const,
      gestion: "2024",
      alineamientoPei: "OE-05: Garantizar sostenibilidad financiera",
      actividades: [
        { descripcion: "Contratar 2 ejecutivos de cuenta adicionales", estado: "terminado", plazo: "30" },
        { descripcion: "Lanzar programa de referidos con incentivos mejorados", estado: "terminado", plazo: "30" },
        { descripcion: "Abrir canal de ventas en Colombia (formal)", estado: "en_curso", plazo: "60" },
        { descripcion: "Desarrollar propuesta de servicios de IA", estado: "en_curso", plazo: "60" },
        { descripcion: "Participar en 4 eventos como sponsor", estado: "pendiente", plazo: "90" },
      ],
      kpis: [
        { nombre: "Ingresos anuales", metrica: "USD facturados", meta: "$2.5M", valorActual: "$1.2M" },
        { nombre: "Clientes nuevos", metrica: "Cantidad clientes", meta: "30", valorActual: "14" },
        { nombre: "NPS", metrica: "Net Promoter Score", meta: "≥ 8.5", valorActual: "8.2" },
      ],
    },
    {
      titulo: "Lanzar primer producto propio (SaaS)",
      descripcion: "MVP en producción con 10 clientes piloto",
      tipo: "ESTRATEGICO" as const,
      estado: "EN_PROGRESO" as const,
      gestion: "2024",
      alineamientoPei: "OE-04: Impulsar innovación",
      actividades: [
        { descripcion: "Investigación de mercado y validación de idea", estado: "terminado", plazo: "30" },
        { descripcion: "Diseño UX/UI del MVP", estado: "terminado", plazo: "30" },
        { descripcion: "Desarrollo del MVP (backend + frontend)", estado: "en_curso", plazo: "60" },
        { descripcion: "Beta testing con 5 clientes seleccionados", estado: "pendiente", plazo: "90" },
        { descripcion: "Lanzamiento comercial", estado: "pendiente", plazo: "90" },
      ],
      kpis: [
        { nombre: "Avance MVP", metrica: "% funcionalidades completadas", meta: "100%", valorActual: "65%" },
        { nombre: "Clientes piloto", metrica: "Empresas en beta", meta: "10", valorActual: "0" },
      ],
    },
    {
      titulo: "Fortalecer el equipo humano — retención y bienestar",
      descripcion: "Retención ≥ 85%, satisfacción ≥ 80%",
      tipo: "ESTRATEGICO" as const,
      estado: "EN_PROGRESO" as const,
      gestion: "2024",
      alineamientoPei: "OE-03: Fortalecer desarrollo profesional",
      actividades: [
        { descripcion: "Implementar onboarding estandarizado (sistema)", estado: "terminado", plazo: "30" },
        { descripcion: "Lanzar academia interna (4 cursos primer Q)", estado: "en_curso", plazo: "60" },
        { descripcion: "Evaluación 360° primer semestre", estado: "en_curso", plazo: "60" },
        { descripcion: "Programa de bienestar (gym, salud mental)", estado: "pendiente", plazo: "90" },
        { descripcion: "Revisión salarial vs. mercado", estado: "pendiente", plazo: "90" },
      ],
      kpis: [
        { nombre: "Retención", metrica: "% personal retenido", meta: "85%", valorActual: "88%" },
        { nombre: "Satisfacción", metrica: "Encuesta clima laboral", meta: "80%", valorActual: "76%" },
        { nombre: "Capacitación", metrica: "Horas/colaborador/año", meta: "40h", valorActual: "22h" },
      ],
    },
  ];

  for (const obj of objetivos2024) {
    const objetivo = await prisma.objetivo.create({
      data: {
        titulo: obj.titulo,
        descripcion: obj.descripcion,
        tipo: obj.tipo,
        estado: obj.estado,
        gestion: obj.gestion,
        alineamientoPei: obj.alineamientoPei,
        generadoPorIA: false,
        cargoId,
        userId: admin.id,
      },
    });

    for (const act of obj.actividades) {
      await prisma.actividad.create({
        data: {
          descripcion: act.descripcion,
          plazoDias: act.plazo,
          prioridad: "alta",
          estado: act.estado,
          completada: act.estado === "terminado",
          completadaAt: act.estado === "terminado" ? new Date("2024-06-15") : null,
          objetivoId: objetivo.id,
        },
      });
    }

    for (const kpi of obj.kpis) {
      await prisma.kPI.create({
        data: {
          nombre: kpi.nombre,
          metrica: kpi.metrica,
          meta: kpi.meta,
          valorActual: kpi.valorActual,
          frecuencia: "trimestral",
          objetivoId: objetivo.id,
        },
      });
    }
  }

  // Upload POA 2023 document
  const poa2023 = fs.readFileSync(path.join(__dirname, "docs/poa-2023.md"), "utf-8");
  await prisma.document.create({
    data: {
      name: "POA 2023 — Resultados",
      type: "POI",
      format: "MD",
      rawText: poa2023,
      status: "READY",
      organizationId: admin.organizationId!,
      uploadedById: admin.id,
    },
  });

  console.log("\n✅ Gestión 2023: 4 objetivos (completados) + 15 actividades + 8 KPIs");
  console.log("✅ Gestión 2024: 3 objetivos (en progreso) + 15 actividades + 8 KPIs");
  console.log("✅ Documento POA 2023 cargado");
  console.log("\n🎉 Done! Login con admin@technova.com para ver la comparativa.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
