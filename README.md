# Incorporated 🏢

> **Sistema inteligente de inserción laboral y alineamiento estratégico.**

Incorporated ayuda a nuevos colaboradores a entender qué espera la empresa de su cargo, qué lineamientos y objetivos estratégicos existen, y cómo su rol contribuye al logro institucional.

## Características Principales

- 🎯 **Alineamiento estratégico:** OKRs, KPIs y objetivos vinculados al cargo
- 📄 **Gestión documental:** Sube PEI, FODA, MOF y la IA genera lineamientos
- 🤖 **IA Híbrida:** Funciona con Gemini (cloud), Ollama (local) o sin IA
- 👥 **Modo Empresa:** Admin/RRHH gestiona estructura, cargos y documentos
- 👤 **Modo Individual:** El usuario auto-gestiona sus documentos y objetivos
- 🏗️ **Construye mis lineamientos:** IA analiza PEI/FODA y genera objetivos para tu cargo
- ✅ **Checklist de onboarding:** Plan 30/60/90 días personalizado

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Base de datos | Neon (PostgreSQL serverless) + pgvector |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js v5) |
| Storage | Vercel Blob |
| IA | Vercel AI SDK (Gemini / Ollama / Sin IA) |
| RAG | LangChain.js + pgvector |
| Deploy | Vercel |

## Modos de IA

| Modo | Descripción | Caso de Uso |
|------|-------------|-------------|
| **Gemini (Cloud)** | Google Gemini API | Empresas con acceso a internet |
| **Ollama (Local)** | Modelo local (Llama, Mistral) | Empresas con data sensible |
| **Sin IA** | Solo contenido estructurado manual | Entornos sin acceso a LLMs |

## Documentación

- 📄 [Especificaciones de Diseño (SDD)](docs/SDD_Incorporated.md)

## Estado del Proyecto

- [x] Documento de especificaciones (SDD)
- [ ] Setup del proyecto Next.js
- [ ] Modelo de datos (Prisma)
- [ ] Sistema de autenticación
- [ ] Módulo de gestión de cargos
- [ ] Pipeline RAG para documentos
- [ ] Asistente IA
- [ ] Modo "Construye mis lineamientos"
- [ ] Deploy en Vercel

## Licencia

Privado — Todos los derechos reservados.
