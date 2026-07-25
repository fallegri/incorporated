import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/faq — Generate FAQ from user's data WITHOUT AI
 * Builds contextual questions from objectives, cargo info,
 * activities, KPI descriptions, and documents
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    // Fetch user context data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        createdAt: true,
        cargo: {
          select: { name: true, description: true, competencias: true },
        },
      },
    });

    const objetivos = await prisma.objetivo.findMany({
      where: { userId: user.id },
      include: {
        actividades: true,
        kpis: true,
      },
    });

    // Get document count
    const whereClause: any = {};
    if (user.organizationId) {
      whereClause.organizationId = user.organizationId;
    } else {
      whereClause.uploadedById = user.id;
    }
    const docCount = await prisma.document.count({ where: whereClause });

    // Build FAQ entries
    interface FAQItem {
      id: string;
      category: string;
      question: string;
      answer: string;
    }

    const faqs: FAQItem[] = [];
    let faqId = 0;

    // ---- CATEGORY: Primeros pasos ----
    const cargoName = dbUser?.cargo?.name || "tu cargo";
    const cargoDesc = dbUser?.cargo?.description || "";
    const competencias = dbUser?.cargo?.competencias || [];

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Primeros pasos",
      question: "¿Que se espera de mi en los primeros 30 dias?",
      answer: buildFirst30DaysAnswer(objetivos, cargoName),
    });

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Primeros pasos",
      question: "¿Cuales son mis responsabilidades principales?",
      answer: buildResponsibilitiesAnswer(cargoName, cargoDesc, competencias),
    });

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Primeros pasos",
      question: "¿Como esta estructurado mi periodo de adaptacion?",
      answer: "Tu periodo de adaptacion se organiza en tres fases: " +
        "los primeros 30 dias se enfocan en conocer la organizacion, documentos clave y tu equipo; " +
        "del dia 31 al 60 se espera que inicies actividades operativas y muestres primeros resultados; " +
        "del dia 61 al 90 se realiza una evaluacion integral de tu desempeno y alineamiento con los objetivos.",
    });

    // ---- CATEGORY: Objetivos y Metas ----
    if (objetivos.length > 0) {
      const topObjective = objetivos.reduce((max, obj) => {
        const actCount = obj.actividades.length + obj.kpis.length;
        const maxCount = max.actividades.length + max.kpis.length;
        return actCount > maxCount ? obj : max;
      }, objetivos[0]);

      faqs.push({
        id: `faq-${++faqId}`,
        category: "Objetivos y Metas",
        question: "¿Cual es el objetivo con mas peso en mi area?",
        answer: `Tu objetivo principal es "${topObjective.titulo}" (${topObjective.tipo.toLowerCase()}). ` +
          `Tiene ${topObjective.actividades.length} actividad(es) asociada(s) y ${topObjective.kpis.length} KPI(s) de seguimiento.`,
      });

      faqs.push({
        id: `faq-${++faqId}`,
        category: "Objetivos y Metas",
        question: "¿Cuantos objetivos tengo asignados?",
        answer: `Actualmente tienes ${objetivos.length} objetivo(s) asignado(s): ` +
          `${objetivos.filter(o => o.tipo === "ESTRATEGICO").length} estrategico(s) y ` +
          `${objetivos.filter(o => o.tipo === "OPERATIVO").length} operativo(s). ` +
          objetivos.map(o => `"${o.titulo}"`).join(", ") + ".",
      });

      const totalActividades = objetivos.reduce((sum, o) => sum + o.actividades.length, 0);
      const completadas = objetivos.reduce(
        (sum, o) => sum + o.actividades.filter(a => a.completada).length, 0
      );

      faqs.push({
        id: `faq-${++faqId}`,
        category: "Objetivos y Metas",
        question: "¿Como va mi progreso general?",
        answer: totalActividades > 0
          ? `Tienes ${totalActividades} actividad(es) en total, de las cuales ${completadas} esta(n) completada(s) ` +
            `(${Math.round((completadas / totalActividades) * 100)}% de avance).`
          : "Aun no tienes actividades asignadas. Consulta con tu supervisor para definir tus primeras tareas.",
      });
    } else {
      faqs.push({
        id: `faq-${++faqId}`,
        category: "Objetivos y Metas",
        question: "¿Cual es el objetivo con mas peso en mi area?",
        answer: "Aun no tienes objetivos asignados en el sistema. Tu supervisor o el area de planificacion " +
          "debera asignarte objetivos estrategicos y operativos alineados a tu cargo.",
      });
    }

    // ---- CATEGORY: KPIs e Indicadores ----
    const allKpis = objetivos.flatMap(o => o.kpis);
    if (allKpis.length > 0) {
      faqs.push({
        id: `faq-${++faqId}`,
        category: "KPIs e Indicadores",
        question: "¿Como se mide mi desempeno?",
        answer: `Tu desempeno se mide a traves de ${allKpis.length} KPI(s): ` +
          allKpis.map(k => `"${k.nombre}" (meta: ${k.meta})`).join(", ") + ". " +
          "El semaforo de cumplimiento es: verde (>=75%), amarillo (>=50%), rojo (<50%).",
      });

      faqs.push({
        id: `faq-${++faqId}`,
        category: "KPIs e Indicadores",
        question: "¿Con que frecuencia se revisan los KPIs?",
        answer: "Las frecuencias de revision de tus KPIs son: " +
          allKpis.map(k => `"${k.nombre}" se revisa ${k.frecuencia}`).join("; ") + ".",
      });
    } else {
      faqs.push({
        id: `faq-${++faqId}`,
        category: "KPIs e Indicadores",
        question: "¿Como se mide mi desempeno?",
        answer: "Aun no tienes KPIs asignados. Estos se definen junto con tus objetivos y permiten " +
          "medir cuantitativamente tu avance. El semaforo es: verde (>=75%), amarillo (>=50%), rojo (<50%).",
      });
    }

    // ---- CATEGORY: Documentos ----
    faqs.push({
      id: `faq-${++faqId}`,
      category: "Documentos",
      question: "¿Que documentos institucionales debo conocer?",
      answer: docCount > 0
        ? `Hay ${docCount} documento(s) cargados en la biblioteca institucional. ` +
          "Revisa especialmente los documentos tipo PEI (Plan Estrategico), FODA, y MOF (Manual de Funciones) " +
          "para comprender la estrategia y estructura de la organizacion."
        : "Aun no hay documentos cargados. Solicita a tu supervisor los documentos institucionales clave: " +
          "PEI, FODA, MOF y POI.",
    });

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Documentos",
      question: "¿Para que sirve la seccion 'Construir Lineamientos'?",
      answer: "La seccion 'Construir Lineamientos' analiza los documentos institucionales y extrae " +
        "automaticamente objetivos estrategicos, KPIs y actividades. Puedes usarla en modo patron " +
        "(sin IA) o con asistencia de IA para generar lineamientos alineados al PEI.",
    });

    // ---- CATEGORY: Plazos y Ritmos ----
    faqs.push({
      id: `faq-${++faqId}`,
      category: "Plazos y Ritmos",
      question: "¿Cada cuanto se actualizan los objetivos?",
      answer: "Los objetivos se revisan con los siguientes ritmos: " +
        "trimestralmente se evalua el avance de KPIs, " +
        "semestralmente se ajustan metas si es necesario, " +
        "y anualmente se realiza la planificacion estrategica completa.",
    });

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Plazos y Ritmos",
      question: "¿Que pasa si no cumplo un plazo?",
      answer: "Las actividades vencidas aparecen en el sistema de notificaciones con alerta roja. " +
        "Se recomienda comunicar proactivamente cualquier retraso a tu supervisor y ajustar prioridades. " +
        "El sistema calcula automaticamente el semaforo de cumplimiento.",
    });

    // ---- CATEGORY: Uso del Sistema ----
    faqs.push({
      id: `faq-${++faqId}`,
      category: "Uso del Sistema",
      question: "¿Como actualizo el estado de mis actividades?",
      answer: "Ve a 'Mis Actividades' en el menu lateral. Cada actividad tiene un boton para cambiar " +
        "su estado: pendiente, en curso, o terminado. Al marcar como terminada, se actualiza " +
        "automaticamente el progreso del objetivo asociado.",
    });

    faqs.push({
      id: `faq-${++faqId}`,
      category: "Uso del Sistema",
      question: "¿Como registro avance en mis KPIs?",
      answer: "En la seccion 'Mis KPIs' puedes actualizar el valor actual de cada indicador. " +
        "El sistema calcula automaticamente el porcentaje de cumplimiento respecto a la meta " +
        "y muestra el semaforo correspondiente (verde, amarillo o rojo).",
    });

    return NextResponse.json({
      total: faqs.length,
      categories: [...new Set(faqs.map(f => f.category))],
      faqs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al generar FAQ: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}

function buildFirst30DaysAnswer(
  objetivos: any[],
  cargoName: string
): string {
  const first30Activities = objetivos
    .flatMap(o => o.actividades)
    .filter(a => parseInt(a.plazoDias) <= 30);

  if (first30Activities.length > 0) {
    return `En los primeros 30 dias como ${cargoName}, debes completar ${first30Activities.length} actividad(es): ` +
      first30Activities.map(a => `"${a.descripcion}"`).slice(0, 3).join(", ") +
      (first30Activities.length > 3 ? ` y ${first30Activities.length - 3} mas.` : ".") +
      " Ademas, familiarizate con los documentos institucionales y el equipo de trabajo.";
  }

  return `En los primeros 30 dias como ${cargoName}, se espera que te familiarices con ` +
    "la organizacion, revises los documentos institucionales (PEI, FODA, MOF), " +
    "conozcas a tu equipo, y comprendas tus objetivos y KPIs asignados.";
}

function buildResponsibilitiesAnswer(
  cargoName: string,
  cargoDesc: string,
  competencias: string[]
): string {
  let answer = `Como ${cargoName}`;

  if (cargoDesc) {
    answer += `, tu rol se define como: ${cargoDesc}`;
  } else {
    answer += ", tus responsabilidades estan definidas por los objetivos y actividades asignados en el sistema";
  }

  if (competencias.length > 0) {
    answer += `. Las competencias clave para tu cargo son: ${competencias.join(", ")}`;
  }

  answer += ".";
  return answer;
}
