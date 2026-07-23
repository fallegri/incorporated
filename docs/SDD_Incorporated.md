# Documento de Especificaciones de Diseño de Software (SDD)
## **Incorporated — Sistema Inteligente de Inserción Laboral y Alineamiento Estratégico**

---

| Campo | Detalle |
|-------|---------|
| **Versión** | 1.0.0 |
| **Fecha** | 2026-07-22 |
| **Estado** | Borrador Inicial |
| **Clasificación** | Confidencial — Uso Interno |
| **Estándares** | IEEE 1016 (SDD), ISO/IEC/IEEE 42010:2022, SOLID, OWASP, WCAG 2.1 |
| **Autor** | Equipo de Desarrollo Incorporated |

---

## Tabla de Contenidos

1. Introducción
2. Alcance
3. Referencias Normativas
4. Definiciones y Acrónimos
5. Descripción Arquitectónica (ISO 42010)
6. Requisitos Funcionales
7. Requisitos No Funcionales
8. Diseño del Sistema IA
9. Principios SOLID Aplicados
10. Diseño UX/UI
11. Seguridad, Privacidad y Consideraciones OSINT
12. Buenas Prácticas de Desarrollo
13. Apéndices

---

## 1. Introducción

### 1.1 Propósito

Este documento define las especificaciones de diseño de software para **Incorporated**, un sistema web inteligente que facilita la inserción laboral de colaboradores en nuevos cargos, permitiéndoles comprender qué espera la organización de su rol, qué lineamientos y objetivos estratégicos existen, y cómo su posición contribuye al logro institucional.

El sistema incorpora inteligencia artificial híbrida (cloud, local o sin IA) para analizar documentos organizacionales (PEI, FODA, MOF) y generar automáticamente lineamientos, objetivos y actividades personalizadas para cada cargo.

### 1.2 Visión del Producto

> *"Que cada persona que llega a un nuevo cargo tenga claridad absoluta sobre qué se espera de ella, cómo contribuye a los objetivos organizacionales, y cuál es su camino de éxito — desde el día uno."*

---

## 2. Alcance

### 2.1 Modos de Operación

- **Modo Empresa:** Admin/RRHH carga estructura organizacional, documentos y asigna usuarios a cargos
- **Modo Individual:** El usuario sube sus propios documentos y la IA genera lineamientos

### 2.2 Modos de IA

- **Gemini (Cloud):** Google Gemini API — default, requiere internet
- **Ollama (Local):** Modelo local — para data sensible, sin internet
- **Sin IA (None):** Solo CRUD manual — fallback, siempre funcional

### 2.3 Features In-Scope (v1.0)

1. Autenticación con roles (empresa/individual)
2. Gestión de estructura organizacional (áreas, cargos, jerarquía)
3. Perfil de cargo (descripción, competencias, reporta a, le reportan)
4. Upload y procesamiento de documentos (PDF: PEI, FODA, MOF, POI)
5. Definición y asignación de OKRs y KPIs por cargo
6. Lineamientos y objetivos estratégicos vinculados al cargo
7. Modo "Construye mis lineamientos" (IA genera desde docs)
8. Asistente IA conversacional sobre documentos (RAG)
9. Checklist de onboarding personalizado (30/60/90 días)
10. Dashboard de avance y cumplimiento de objetivos
11. Modo sin IA (solo contenido manual/estructurado)
12. Modo IA local (Ollama) para datos sensibles
13. Modo IA cloud (Gemini) como opción predeterminada
14. Multi-tenancy (múltiples organizaciones)

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Base de datos | Neon (PostgreSQL serverless) + pgvector |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js v5) |
| Storage | Vercel Blob |
| IA | Vercel AI SDK (Gemini / Ollama / Sin IA) |
| RAG | pgvector embeddings + similarity search |
| Deploy | Vercel |

---

## 4. Arquitectura

### 4.1 Viewpoint Lógico

Capas: Presentación (Next.js App Router) → Aplicación (Services/Use Cases) → Dominio (Entities) → Infraestructura (Prisma, AI Providers, Blob Storage)

### 4.2 Decisiones Arquitectónicas (ADRs)

- **ADR-001:** Monorepo Next.js full-stack (un solo deploy en Vercel)
- **ADR-002:** IA como Provider intercambiable (Strategy Pattern: Gemini/Ollama/None)
- **ADR-003:** pgvector en Neon para RAG (misma DB, sin servicio vectorial adicional)
- **ADR-004:** Vercel AI SDK para integración con LLMs (streaming nativo)
- **ADR-005:** Prisma como ORM (type-safe, migraciones automáticas)
- **ADR-006:** Multi-tenancy por columna org_id (simple, eficiente)

### 4.3 Modelo de Datos Principal

- Organization (id, name, mode, ai_provider)
- User (id, email, name, role, org_id, cargo_id)
- Area (id, name, org_id, parent_id, director_id)
- Cargo (id, name, description, competencias[], reports_to, area_id)
- Objetivo (id, cargo_id, tipo, descripcion, alineamiento_pei, estado)
- OKR (id, objective, key_results[], progress, periodo)
- KPI (id, name, metric, target, current, frequency)
- Actividad (id, descripcion, plazo_dias, estado, prioridad)
- Document (id, org_id, name, type, url, processed, chunks_count)
- DocumentChunk (id, document_id, content, embedding vector(768), chunk_index)
- OnboardingChecklist (id, user_id, cargo_id, items[], progress)

### 4.4 Roles del Sistema

- **Super Admin:** Gestión de la plataforma
- **Admin/Gerente:** Crear org, cargos, subir docs, gestionar usuarios
- **Director:** Ver área completa, validar OKRs, oversight
- **Jefe de Área:** Definir KPIs subordinados, ver avance equipo
- **Jefe de Proyecto:** OKRs de proyecto, asignar tareas
- **Colaborador:** Ver su cargo, objetivos, usar asistente, checklist
- **Usuario Individual:** Auto-gestión total (modo individual)

---

## 5. Requisitos Funcionales (28 Historias de Usuario)

### EP-01: Autenticación (RF-01 a RF-04)
- Registro con modo empresa/individual
- Login con email/password
- Invitación de usuarios por admin
- Gestión de roles y permisos

### EP-02: Estructura Organizacional (RF-05 a RF-08)
- CRUD de áreas con jerarquía
- CRUD de cargos dentro de áreas
- Definición manual de cargo (modo individual)
- Organigrama visual

### EP-03: Gestión Documental (RF-09 a RF-12)
- Upload de PDFs (PEI, FODA, MOF, POI)
- Procesamiento: extracción → chunking → embeddings → pgvector
- Lista de documentos con estado de procesamiento
- IA sugiere docs adicionales a subir

### EP-04: Lineamientos y Objetivos (RF-13 a RF-17)
- CRUD de objetivos estratégicos por cargo
- Vista de alineamiento: cargo → área → PEI
- "Construye mis lineamientos" (IA genera desde docs)
- Edición y confirmación de lineamientos generados
- Validación/aprobación por jefe de área

### EP-05: OKRs y KPIs (RF-18 a RF-20)
- Definir OKRs para cargo/área
- Actualizar progreso de Key Results
- Ver KPIs con semáforo visual

### EP-06: Asistente IA (RF-21 a RF-23)
- Chat RAG sobre documentos organizacionales
- Preguntas contextualizadas al cargo del usuario
- Modo sin IA: búsqueda por keyword + FAQ

### EP-07: Onboarding (RF-24 a RF-26)
- Checklist personalizado 30/60/90 días
- Admin define checklist por cargo
- Jefe ve avance de sus nuevos colaboradores

### EP-08: Dashboard (RF-27 a RF-28)
- Dashboard personalizado por rol
- Estadísticas de la organización (admin)

---

## 6. Requisitos No Funcionales (33 RNFs)

- Performance: dashboard < 1.5s, API < 500ms, IA streaming < 2s primer token
- Escalabilidad: ≥100 orgs, ≥500 users/org, ≥50K chunks
- Fiabilidad: 99.5% uptime, funciona 100% sin IA
- Seguridad: multi-tenant aislado, HTTPS, bcrypt, rate limiting IA
- Usabilidad: WCAG 2.1 AA, responsive, onboarding < 5 min
- Mantenibilidad: 80% coverage, 0 lint errors, provider IA intercambiable en < 1 día

---

## 7. Sistema IA — Diseño

### 7.1 Strategy Pattern (Providers)

```typescript
interface AIProvider {
  readonly name: 'gemini' | 'ollama' | 'none';
  chat(messages, context?): AsyncIterable<string>;
  embed(text): Promise<number[]>;
  generateStructured<T>(prompt, schema): Promise<T>;
  isAvailable(): Promise<boolean>;
}
```

Implementaciones: GeminiProvider, OllamaProvider, NoAIProvider

### 7.2 Pipeline RAG

Ingesta: PDF → texto → chunks (500 tokens) → embeddings → pgvector
Consulta: query → embed → similarity search (top-5) → contexto → LLM → respuesta

### 7.3 Modo "Construye mis Lineamientos"

Input: cargo info + chunks relevantes de PEI/FODA/MOF
Output (schema Zod): 3-5 objetivos con KPIs, actividades, plan 30/60/90
El usuario SIEMPRE revisa, edita y confirma antes de guardar.

### 7.4 Modo Sin IA

- Chat: búsqueda por keyword + FAQ predefinidas
- Lineamientos: creación manual solamente
- Dashboard/CRUD: 100% funcional

---

## 8. Seguridad

- OWASP Top 10 mitigado
- Multi-tenant: org_id en toda query, RLS
- Docs sensibles: URLs firmadas con TTL
- Ollama: datos NUNCA salen de la red local
- API keys: server-side only, nunca en client
- Rate limiting: 30 req/min/user en endpoints IA

---

## 9. Buenas Prácticas

- Estructura: src/app (pages), src/lib (logic), src/components (UI), prisma/ (schema)
- TypeScript estricto, ESLint + Prettier
- Conventional Commits
- CI/CD: lint → test → build → deploy (Vercel auto)
- Testing: Vitest (unit), Testing Library (components), Playwright (E2E)

---

## 10. Variables de Entorno

- DATABASE_URL (Neon)
- NEXTAUTH_URL, NEXTAUTH_SECRET
- AI_PROVIDER ("gemini" | "ollama" | "none")
- GOOGLE_GENERATIVE_AI_API_KEY
- OLLAMA_BASE_URL, OLLAMA_MODEL
- BLOB_READ_WRITE_TOKEN

---

*Fin del documento — SDD Incorporated v1.0.0*
