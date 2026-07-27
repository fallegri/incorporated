# Incorporated

## Sistema Inteligente de Insercion Laboral y Alineamiento Estrategico

> *"Que cada persona que llega a un nuevo cargo tenga claridad absoluta sobre que se espera de ella, como contribuye a los objetivos organizacionales, y cual es su camino de exito desde el dia uno."*

---

## Tabla de Contenidos

1. [Descripcion](#descripcion)
2. [Caracteristicas Principales](#caracteristicas-principales)
3. [Modos de Operacion](#modos-de-operacion)
4. [Modos de IA](#modos-de-ia)
5. [Flujo Empresarial](#flujo-empresarial-ideal)
6. [Flujo Individual](#flujo-individual)
7. [Stack Tecnologico](#stack-tecnologico)
8. [Arquitectura](#arquitectura)
9. [Seguridad](#seguridad)
10. [Principios de Desarrollo](#principios-de-desarrollo)
11. [Instalacion](#instalacion)
12. [Variables de Entorno](#variables-de-entorno)
13. [API Endpoints](#api-endpoints)
14. [Usuarios de Prueba](#usuarios-de-prueba)
15. [Estructura del Proyecto](#estructura-del-proyecto)
16. [Temas Visuales](#temas-visuales)
17. [Documentacion](#documentacion)
18. [Creditos](#creditos)

---

## Descripcion

**Incorporated** es una plataforma web que resuelve los problemas de:

- **Desorientacion inicial:** El nuevo colaborador no sabe que se espera de el
- **Desalineamiento:** Los objetivos personales no conectan con la estrategia
- **Documentacion dispersa:** PEI, FODA, MOF en carpetas que nadie lee
- **Onboarding generico:** Misma induccion para todos sin personalizacion

El sistema analiza documentos organizacionales (PEI, FODA, MOF, POA) y genera automaticamente lineamientos, objetivos estrategicos, KPIs y actividades personalizadas para cada cargo, utilizando inteligencia artificial o analisis basado en patrones.

---

## Caracteristicas Principales

| # | Caracteristica | Descripcion |
|---|---|---|
| 1 | **Construir Lineamientos** | Generacion de objetivos, KPIs y actividades a partir de documentos organizacionales (IA o patrones) |
| 2 | **Gestion de Documentos** | Carga, extraccion de texto y analisis de documentos PEI, FODA, MOF, POI |
| 3 | **Objetivos Estrategicos** | Gestion de objetivos con estados (Borrador, Pendiente Aprobacion, Aprobado, En Progreso, Completado) |
| 4 | **Actividades** | Maquina de estados (pendiente -> en_curso -> terminado) con actualizacion automatica de objetivo padre |
| 5 | **KPIs** | Indicadores con semaforo automatico (verde >= 75%, amarillo >= 50%, rojo < 50%) |
| 6 | **Comparativa Multi-Gestion** | Comparacion anual de metricas entre gestiones/periodos |
| 7 | **Asistente IA (Chat)** | Chat contextual con RAG sobre documentos de la organizacion |
| 8 | **Glosario** | Terminos organizacionales con definiciones |
| 9 | **FAQ** | Preguntas frecuentes sobre la plataforma y procesos |
| 10 | **Timeline** | Linea de tiempo de eventos y actividades del usuario |
| 11 | **Notificaciones** | Alertas de vencimiento, KPIs criticos, prioridades |
| 12 | **Reportes** | Generacion de reportes (Progreso, POA, KPIs) con filtrado por gestion |
| 13 | **Vista Gerente** | Dashboard dual para gerentes con metricas de equipo y avance |
| 14 | **Setup Wizard Empresarial** | Asistente de 5 pasos para configurar la organizacion |

---

## Modos de Operacion

### Modo Empresarial (Enterprise)

Disenado para organizaciones con estructura jerarquica:

- **Setup Wizard de 5 pasos:** Informacion basica, Areas, Cargos, Usuarios, Documentos
- **Roles jerarquicos:** SUPER_ADMIN > ADMIN > DIRECTOR > JEFE_AREA > JEFE_PROYECTO > COLABORADOR
- **Flujo de aprobacion:** Lineamientos generados requieren aprobacion de niveles superiores
- **Multi-tenant:** Aislamiento de datos por organizacion
- **Publicacion:** La empresa se publica y los empleados ven datos pre-cargados

### Modo Individual (Self-managed)

Disenado para freelancers y profesionales independientes:

- **Auto-registro:** El usuario se registra y crea su propia organizacion
- **Sin jerarquia:** El usuario es INDIVIDUAL con acceso completo a sus datos
- **Documentos propios:** Sube su plan de negocio, portafolio u otros documentos
- **IA genera:** Los lineamientos se generan directamente sin aprobacion

---

## Modos de IA

El sistema implementa el **Strategy Pattern** para manejar multiples proveedores de IA:

| Proveedor | Modelo | Uso |
|---|---|---|
| **NVIDIA NIM** | `meta/llama-3.1-8b-instruct` | Generacion de lineamientos y chat (API cloud) |
| **Google Gemini** | `gemini-pro` | Generacion de lineamientos y chat (API cloud) |
| **Ollama** | Configurable | Ejecucion local de modelos (self-hosted) |
| **Sin IA** | N/A | Analisis basado en patrones sin dependencia de IA externa |

La seleccion del proveedor se realiza por organizacion, permitiendo que cada empresa elija su estrategia de IA.

---

## Flujo Empresarial Ideal

```
1. ADMIN registra empresa
        |
2. Setup Wizard (5 pasos)
   +-- Paso 1: Mision, Vision, Sector
   +-- Paso 2: Crear Areas organizacionales
   +-- Paso 3: Definir Cargos por area
   +-- Paso 4: Invitar Usuarios (email + rol + cargo)
   +-- Paso 5: Subir Documentos (PEI, FODA, MOF, POA)
        |
3. ADMIN configura proveedor de IA
        |
4. ADMIN publica empresa (status: setup -> active)
        |
5. Empleados inician sesion
   +-- Ven documentos pre-cargados
        |
6. Cada empleado ejecuta "Construir Lineamientos"
   +-- Selecciona documentos relevantes
   +-- IA genera objetivos, KPIs y actividades para su cargo
   +-- Resultados se guardan como Borrador
        |
7. Jefe/Director aprueba lineamientos
        |
8. Empleado trabaja con:
   +-- Actividades (pendiente -> en_curso -> terminado)
   +-- KPIs (actualiza valores, ve semaforo)
   +-- Asistente IA (consultas contextuales)
   +-- Checklist de onboarding (30/60/90 dias)
```

### Documentacion Requerida Ideal (Empresa)

| Documento | Tipo | Contenido esperado |
|---|---|---|
| PEI | Plan Estrategico Institucional | Mision, vision, objetivos estrategicos a 4-5 anios |
| FODA | Analisis FODA | Fortalezas, Oportunidades, Debilidades, Amenazas |
| MOF | Manual de Organizacion y Funciones | Funciones por cargo, competencias, dependencias |
| POA | Plan Operativo Anual | Objetivos operativos, actividades, indicadores del anio |

---

## Flujo Individual

```
1. Usuario se auto-registra (modo individual)
        |
2. Sistema crea organizacion personal automaticamente
        |
3. Usuario define su cargo/rol
        |
4. Sube documentos propios:
   +-- Plan de negocio
   +-- Portafolio de servicios
   +-- Cualquier documento relevante
        |
5. Ejecuta "Construir Lineamientos"
   +-- IA analiza documentos
   +-- Genera objetivos, KPIs y actividades
        |
6. Lineamientos se aprueban automaticamente
        |
7. Trabaja con el sistema:
   +-- Gestiona actividades
   +-- Actualiza KPIs
   +-- Consulta asistente IA
   +-- Ve reportes de progreso
```

---

## Stack Tecnologico

| Categoria | Tecnologia | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.x |
| Lenguaje | TypeScript | 5.x |
| Base de datos | Neon PostgreSQL | Serverless |
| ORM | Prisma | 5.22.0 |
| Autenticacion | NextAuth.js (Auth.js) | 5.0-beta.32 |
| IA (NVIDIA) | NVIDIA NIM API | meta/llama-3.1-8b-instruct |
| IA (Google) | @ai-sdk/google | 4.x |
| IA (Local) | Ollama | Configurable |
| Estilos | Tailwind CSS | 4.x |
| Validacion | Zod | 4.x |
| 2FA | otplib + qrcode | 13.x |
| PDF | pdf-parse | 1.1.1 |
| Word | mammoth | 1.12.x |
| Deploy | Vercel | Edge + Serverless |
| Runtime | React | 19.x |

---

## Arquitectura

### Capas de la Aplicacion (ISO 42010)

```
+---------------------------------------------------+
|           CAPA DE PRESENTACION                    |
|   Next.js App Router + React Server Components    |
|   (src/app/, src/components/)                     |
+---------------------------------------------------+
|           CAPA DE APLICACION                      |
|   API Routes + Server Actions                     |
|   (src/app/api/)                                  |
+---------------------------------------------------+
|           CAPA DE DOMINIO                         |
|   Services + Business Logic                       |
|   (src/lib/services/, src/lib/ai/)                |
+---------------------------------------------------+
|           CAPA DE INFRAESTRUCTURA                 |
|   Prisma ORM + Neon PostgreSQL                    |
|   (src/lib/db/, prisma/)                          |
+---------------------------------------------------+
```

### Strategy Pattern para IA

```
         +---------------+
         |  AIProvider   |  (Interface)
         |  Interface    |
         +-------+-------+
                 |
    +------------+-------------+--------------+
    |            |             |              |
+---v----+  +---v----+  +----v-----+  +------v------+
| Gemini |  | NVIDIA |  |  Ollama  |  |    NoAI     |
|Provider|  |Provider|  | Provider |  |  Provider   |
+--------+  +--------+  +----------+  +-------------+
```

### Modelos de Datos (13 modelos Prisma)

1. **Organization** - Empresa/organizacion con modo y proveedor IA
2. **User** - Usuarios con roles, 2FA, organizacion
3. **Area** - Areas organizacionales con jerarquia
4. **Cargo** - Cargos/puestos con competencias
5. **Objetivo** - Objetivos estrategicos/operativos con estados
6. **KPI** - Indicadores clave de rendimiento
7. **OKR** - Objectives and Key Results
8. **Actividad** - Actividades con maquina de estados
9. **Document** - Documentos con extraccion de texto
10. **DocumentChunk** - Fragmentos para RAG/embeddings
11. **OnboardingChecklist** - Checklists de incorporacion
12. **ChatSession** - Sesiones del asistente IA
13. **ChatMessage** - Mensajes de chat con fuentes

### ADRs (Architectural Decision Records)

| # | Decision | Justificacion |
|---|---|---|
| ADR-001 | Next.js App Router | Server Components + API Routes en un solo proyecto |
| ADR-002 | Neon PostgreSQL Serverless | Escalabilidad automatica, compatible con Vercel |
| ADR-003 | Strategy Pattern para IA | Intercambio de proveedores sin modificar logica de negocio |
| ADR-004 | NextAuth.js v5 con JWT | Sesiones stateless para Edge Runtime |
| ADR-005 | Prisma como ORM | Type-safety, migraciones, schema declarativo |
| ADR-006 | Multi-tenant por org_id | Aislamiento de datos sin bases de datos separadas |

---

## Seguridad

### Medidas Implementadas

| Medida | Implementacion | Detalle |
|---|---|---|
| **Rate Limiting** | In-memory por instancia | Login: 5/15min, Registro: 3/hr, IA: 30/min, API: 100/min, Upload: 10/min |
| **RBAC (7 roles)** | Jerarquia numerica | SUPER_ADMIN(100) > ADMIN(80) > DIRECTOR(60) > JEFE_AREA(40) > JEFE_PROYECTO(30) > COLABORADOR(20) > INDIVIDUAL(10) |
| **Security Headers** | Middleware Next.js | CSP, X-Frame-Options, HSTS |
| **2FA TOTP** | otplib + QR Code | Autenticacion de dos factores con Google Authenticator |
| **File Validation** | Firma + tamano | Validacion de magic bytes y limites de tamano por tipo |
| **Prompt Injection** | sanitizeForAI() | Sanitizacion de inputs antes de enviar a proveedores IA |
| **Audit Log** | auditLog() | Registro de acciones criticas (login, cambios de rol, eliminaciones) |
| **Password Hashing** | bcryptjs (12 rounds) | Hash seguro de contrasenas |
| **JWT Sessions** | NextAuth.js | Tokens stateless con firma criptografica |
| **Multi-tenant** | org_id isolation | Queries filtradas por organizacion del usuario |
| **Input Sanitization** | sanitizeText() | Limpieza de XSS y caracteres peligrosos |
| **File Name Sanitization** | sanitizeFilename() | Prevencion de path traversal |

### Permisos por Rol

```
SUPER_ADMIN   -> Acceso total al sistema
ADMIN         -> Gestionar organizacion, usuarios, cargos, documentos, IA
DIRECTOR      -> Gestionar areas bajo su mando
JEFE_AREA     -> Aprobar lineamientos, gestionar cargos de su area
JEFE_PROYECTO -> Gestionar su proyecto y equipo
COLABORADOR   -> Ver documentos, construir sus lineamientos
INDIVIDUAL    -> Acceso completo a su organizacion personal
```

---

## Principios de Desarrollo

### SOLID

| Principio | Aplicacion en el proyecto |
|---|---|
| **S** - Single Responsibility | Cada modulo tiene una responsabilidad unica (rate-limiter, role-guard, audit-log, sanitize, file-validation) |
| **O** - Open/Closed | Strategy Pattern permite agregar proveedores de IA sin modificar codigo existente |
| **L** - Liskov Substitution | Todos los AIProvider implementan la misma interfaz y son intercambiables |
| **I** - Interface Segregation | AIProvider define solo los metodos necesarios; capabilities indica que soporta cada proveedor |
| **D** - Dependency Inversion | createAIProvider() es una fabrica que desacopla la seleccion del proveedor de su uso |

### ISO 42010 (Arquitectura de Software)

- **Viewpoints documentados:** Logico (capas), Despliegue (Vercel/Neon), Datos (Prisma schema)
- **Concerns identificados:** Seguridad, Escalabilidad, Mantenibilidad, Testabilidad
- **Stakeholders:** Administradores, Gerentes, Colaboradores, Individuales
- **ADRs formalizados:** 6 decisiones arquitectonicas documentadas

### Patrones de Diseno

- **Strategy Pattern:** Proveedores de IA intercambiables
- **Factory Method:** `createAIProvider()` crea la instancia correcta
- **Repository Pattern:** Prisma como abstraccion de acceso a datos
- **Middleware Pattern:** Auth + Security headers en Edge Runtime
- **Observer Pattern:** Actualizacion automatica de estado de objetivo cuando actividades cambian

---

## Instalacion

### Prerequisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Base de datos PostgreSQL (Neon recomendado)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/fallegri/incorporated.git
cd incorporated

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver seccion Variables de Entorno)

# 4. Generar cliente Prisma
npx prisma generate

# 5. Ejecutar migraciones (si es primera vez)
npx prisma db push

# 6. Cargar datos de prueba (opcional)
npx tsx prisma/seed/seed.ts
npx tsx prisma/seed/seed-ibt.ts

# 7. Iniciar servidor de desarrollo
pnpm dev
```

La aplicacion estara disponible en `http://localhost:3000`

---

## Variables de Entorno

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Proveedor de IA (elegir uno: nvidia, gemini, ollama, none)
AI_PROVIDER="nvidia"

# NVIDIA NIM (si AI_PROVIDER=nvidia)
NVIDIA_API_KEY="nvapi-xxxxxxxxxxxxx"

# Google Gemini (si AI_PROVIDER=gemini)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyXXXXXXXXXXXXX"

# Ollama (si AI_PROVIDER=ollama)
OLLAMA_BASE_URL="http://localhost:11434"
```

---

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/auth/registro` | Registro de usuario (empresa o individual) |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handler (login, logout, session) |
| POST | `/api/auth/2fa/setup` | Configurar 2FA (genera QR code) |
| POST | `/api/auth/2fa/verify` | Verificar codigo TOTP |
| POST | `/api/auth/2fa/disable` | Desactivar 2FA |

### Inteligencia Artificial

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/ai/lineamientos` | Generar lineamientos desde documentos con IA |
| POST | `/api/ai/chat` | Chat contextual con RAG |

### Documentos

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/docs` | Listar documentos de la organizacion |
| POST | `/api/docs/upload` | Subir documento (PDF, DOCX, TXT, MD) |
| GET | `/api/docs/[id]/content` | Obtener contenido extraido |
| POST | `/api/docs/analyze` | Analizar documentos (patrones, sin IA) |
| POST | `/api/docs/analyze/save` | Guardar resultados del analisis |

### Actividades y KPIs

| Metodo | Endpoint | Descripcion |
|---|---|---|
| PATCH | `/api/actividades/[id]` | Actualizar estado de actividad |
| GET | `/api/actividades-list` | Listar actividades del usuario |
| PATCH | `/api/kpis/[id]` | Actualizar valor de KPI |

### Dashboard y Reportes

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/dashboard/gerente` | Metricas de equipo para gerentes |
| GET | `/api/dashboard/comparativa` | Comparativa multi-gestion |
| GET | `/api/reportes` | Generar reportes (progreso, POA, KPIs) |

### Organizacion

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/org/setup` | Guardar datos del Setup Wizard |
| POST | `/api/org/publish` | Publicar empresa (setup -> active) |
| GET | `/api/org/status` | Estado actual de la organizacion |

### Configuracion y Contenido

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET/PUT | `/api/settings/ai` | Configuracion del proveedor de IA |
| GET | `/api/glosario` | Glosario de terminos |
| GET | `/api/faq` | Preguntas frecuentes |
| GET | `/api/timeline` | Timeline de eventos del usuario |

---

## Usuarios de Prueba

> Password para todos: `Test1234!`

### TechNova S.A. (Modo Empresa)

| Email | Rol | Cargo |
|---|---|---|
| `admin@technova.com` | ADMIN | Gerente General |
| `jefe.dev@technova.com` | JEFE_AREA | Jefe de Desarrollo |
| `jefe.marketing@technova.com` | JEFE_AREA | Jefe de Marketing |
| `analista.dh@technova.com` | COLABORADOR | Analista Desarrollo Humano |

### Instituto Boliviano de Tecnologia (Modo Empresa)

| Email | Rol | Cargo |
|---|---|---|
| `admin@ibt.edu.bo` | ADMIN | Rector |
| `academico@ibt.edu.bo` | DIRECTOR | Director Academico |
| `sistemas@ibt.edu.bo` | DIRECTOR | Director de Sistemas |
| `docente@ibt.edu.bo` | COLABORADOR | Docente |

### Freelance (Modo Individual)

| Email | Rol | Cargo |
|---|---|---|
| `diego@freelance.com` | INDIVIDUAL | Ejecutivo de Cuenta (Freelance) |

---

## Estructura del Proyecto

```
incorporated/
+-- prisma/
|   +-- schema.prisma          # Esquema de base de datos (13 modelos)
|   +-- seed/                  # Scripts de datos de prueba
|       +-- seed.ts            # TechNova + Freelance
|       +-- seed-ibt.ts        # Instituto Boliviano de Tecnologia
|       +-- docs-*/            # Documentos de ejemplo por empresa
+-- src/
|   +-- app/
|   |   +-- (auth)/            # Paginas publicas
|   |   |   +-- login/         # Inicio de sesion
|   |   |   +-- registro/      # Registro de usuario
|   |   +-- (dashboard)/       # Paginas protegidas
|   |   |   +-- dashboard/     # Panel principal
|   |   |   +-- construir/     # Construir Lineamientos
|   |   |   +-- objetivos/     # Gestion de objetivos
|   |   |   +-- actividades/   # Gestion de actividades
|   |   |   +-- kpis/          # Indicadores KPI
|   |   |   +-- documentos/    # Gestion documental
|   |   |   +-- asistente/     # Chat IA
|   |   |   +-- admin/         # Panel administrativo
|   |   |   +-- reportes/      # Reportes y exportacion
|   |   |   +-- notificaciones/# Centro de notificaciones
|   |   |   +-- glosario/      # Glosario de terminos
|   |   |   +-- faq/           # Preguntas frecuentes
|   |   |   +-- timeline/      # Linea de tiempo
|   |   |   +-- setup/         # Wizard empresarial
|   |   |   +-- cargo/         # Vista de cargo
|   |   +-- api/               # API REST (25 endpoints)
|   |       +-- auth/          # Autenticacion + 2FA
|   |       +-- ai/            # Lineamientos + Chat
|   |       +-- docs/          # Documentos + Analisis
|   |       +-- actividades/   # CRUD actividades
|   |       +-- kpis/          # CRUD KPIs
|   |       +-- dashboard/     # Gerente + Comparativa
|   |       +-- org/           # Setup + Publish + Status
|   |       +-- reportes/      # Generacion de reportes
|   |       +-- settings/      # Configuracion IA
|   |       +-- glosario/      # API glosario
|   |       +-- faq/           # API FAQ
|   |       +-- timeline/      # API timeline
|   +-- components/
|   |   +-- admin/             # Componentes administrativos
|   |   +-- ai/               # Componentes de IA
|   |   +-- dashboard/         # Componentes del dashboard
|   |   +-- layout/            # Sidebar, ThemeSelector, Header
|   |   +-- ui/               # Componentes base (Button, Card, etc.)
|   +-- lib/
|   |   +-- ai/               # Proveedores IA (Strategy Pattern)
|   |   |   +-- providers/     # Gemini, NVIDIA, Ollama, NoAI
|   |   |   +-- types.ts      # Interfaces AIProvider, AICapabilities
|   |   +-- auth/             # Configuracion NextAuth.js
|   |   +-- db/               # Cliente Prisma
|   |   +-- security/         # Modulos de seguridad
|   |   |   +-- rate-limiter.ts
|   |   |   +-- role-guard.ts
|   |   |   +-- audit-log.ts
|   |   |   +-- sanitize.ts
|   |   |   +-- file-validation.ts
|   |   +-- services/          # Logica de negocio
|   |   +-- utils/            # Utilidades compartidas
|   +-- middleware.ts          # Proteccion de rutas (Edge Runtime)
+-- docs/                      # Documentacion tecnica
+-- package.json
+-- tsconfig.json
+-- next.config.ts
```

---

## Temas Visuales

La aplicacion incluye 6 temas de personalizacion visual:

| Tema | Descripcion | Color principal |
|---|---|---|
| **Default** | Tema claro con azul corporativo | `#2563eb` |
| **Oscuro** | Modo oscuro completo | `#3b82f6` |
| **Calido** | Tonos naranjas y calidos | `#d97706` |
| **Verde** | Tonos esmeralda naturales | `#059669` |
| **Violeta** | Tonos purpura creativos | `#7c3aed` |
| **Contraste** | Alto contraste (accesibilidad) | `#000000` |

El tema seleccionado se persiste en `localStorage` y se aplica automaticamente en cada sesion.

---

## Documentacion

Los siguientes documentos de referencia se encuentran en la carpeta `docs/`:

| Archivo | Contenido |
|---|---|
| `SDD_Incorporated.md` | Software Design Document completo |
| `diagramas-secuencia.md` | 14 diagramas de secuencia (Mermaid) de flujos clave |
| `diagrama-clases.md` | Diagramas de clases con todos los modelos y relaciones |
| `manual-tecnico.md` | Manual tecnico: arquitectura, API, seguridad, despliegue |
| `manual-usuario.md` | Manual de usuario paso a paso (en espanol) |

---

## Creditos

Desarrollado como proyecto de tesis/trabajo de grado, demostrando la aplicacion de:

- Principios SOLID en arquitectura de software
- ISO 42010 para documentacion arquitectonica
- Patrones de diseno (Strategy, Factory, Repository, Middleware, Observer)
- Inteligencia Artificial aplicada a procesos de RRHH
- Seguridad en aplicaciones web modernas
- Desarrollo full-stack con tecnologias de ultima generacion

---

## Licencia

Proyecto privado. Todos los derechos reservados.
