# Incorporated — Contexto del Proyecto

## Descripción
Sistema web de inserción laboral y alineamiento estratégico. Ayuda a nuevos colaboradores a entender su cargo, objetivos y cómo contribuyen a la estrategia organizacional. Incluye IA híbrida para análisis de documentos y generación de lineamientos.

## Decisiones Arquitectónicas Clave
- **Framework:** Next.js 14 (App Router) — monorepo full-stack
- **Base de datos:** Neon (PostgreSQL serverless) + pgvector para embeddings
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 con roles (Admin, Director, Jefe Área, Jefe Proyecto, Colaborador, Individual)
- **IA:** Vercel AI SDK con 3 providers intercambiables (Gemini, Ollama, Sin IA)
- **RAG:** Documentos → chunks → embeddings → pgvector → contexto para LLM
- **Storage:** Vercel Blob para PDFs/documentos
- **Deploy:** Vercel + Neon

## Modos de Operación
- **Empresa:** Admin/RRHH carga estructura org, docs y asigna usuarios a cargos
- **Individual:** Usuario auto-gestiona docs y usa IA para generar lineamientos

## Modos de IA
- `gemini`: Google Gemini API (cloud, default)
- `ollama`: Modelo local via Ollama (privacidad, sin internet)
- `none`: Sin IA, solo contenido estructurado manual

## Feature Principal: "Construye mis Lineamientos"
- Input: PEI, FODA, MOF (docs PDF)
- Proceso: RAG pipeline → análisis → generación
- Output: Objetivos estratégicos, KPIs, actividades para el cargo
- El usuario revisa, edita y confirma

## Principios de Diseño
- SOLID estricto
- Clean Architecture (separación dominio/infra)
- IA como enhancement, no dependencia (funciona sin ella)
- Privacy-first: datos sensibles opcionalmente solo locales
- Multi-tenant: una instancia sirve múltiples organizaciones

## Estándares de Código
- TypeScript estricto (no `any`)
- ESLint + Prettier
- Conventional Commits
- Server Components por defecto, Client solo cuando interactivo
- Prisma para toda interacción con DB (no raw SQL)

## Referencia Completa
#[[file:docs/SDD_Incorporated.md]]
