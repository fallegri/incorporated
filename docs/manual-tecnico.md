# Manual Tecnico - Incorporated

Manual tecnico completo del sistema Incorporated: plataforma de alineamiento estrategico organizacional.

---

## 1. Vision General de la Arquitectura

### 1.1 Tipo de Aplicacion

Incorporated es una aplicacion web monolitica full-stack construida con **Next.js 14 App Router** desplegada en **Vercel**. Utiliza una arquitectura por capas:

| Capa | Tecnologia | Ubicacion |
|------|-----------|-----------|
| Presentacion | React 18 + Tailwind CSS | `src/app/`, `src/components/` |
| Aplicacion | Next.js API Routes (Route Handlers) | `src/app/api/` |
| Dominio | TypeScript services + estrategias | `src/lib/services/`, `src/lib/ai/` |
| Infraestructura | Prisma ORM + PostgreSQL | `prisma/`, `src/lib/db/` |

### 1.2 Diagrama de Arquitectura

```
VERCEL (Deploy)
  Middleware (Edge) | App Router (SSR/CSR) | API Routes
           |                 |                |
  Shared Libraries: auth/ | ai/ | security/ | services/ | db/
                         |
            Neon PostgreSQL (Serverless)

  Proveedores IA: Google Gemini | Ollama
```

---

## 2. Stack Tecnologico

| Componente | Tecnologia | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x |
| Runtime | Node.js | 18+ |
| UI | React | 18.x |
| Estilos | Tailwind CSS | 3.x |
| ORM | Prisma | 5.x |
| Base de Datos | PostgreSQL (Neon serverless) | 15+ |
| Autenticacion | NextAuth.js (Auth.js) | v5 |
| Validacion | Zod | 3.x |
| AI SDK | Vercel AI SDK + Google Generative AI | latest |
| Hashing | bcryptjs | 2.x |
| 2FA | otplib + qrcode | latest |
| Documentos | mammoth (Word extraction) | latest |
| Package Manager | pnpm | 8+ |
| Deploy | Vercel | - |

---

## 3. Estructura del Proyecto

```
incorporated/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos (13 modelos)
│   └── seed.ts                # Script de seed
├── src/
│   ├── app/
│   │   ├── (auth)/            # Paginas publicas (login, registro)
│   │   ├── (dashboard)/       # Paginas protegidas (layout con sidebar)
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── objetivos/     # Gestion de objetivos
│   │   │   ├── actividades/   # Lista de actividades
│   │   │   ├── kpis/          # Dashboard de KPIs
│   │   │   ├── documentos/    # Biblioteca de documentos
│   │   │   ├── construir/     # Construir lineamientos
│   │   │   ├── asistente/     # Chat con asistente IA
│   │   │   ├── admin/         # Panel administrativo
│   │   │   ├── cargo/         # Onboarding checklist
│   │   │   ├── notificaciones/ # Centro de notificaciones
│   │   │   └── reportes/      # Generacion de reportes
│   │   └── api/               # API REST (Route Handlers)
│   │       ├── auth/          # Login, registro, 2FA
│   │       ├── ai/            # Chat, lineamientos
│   │       ├── docs/          # Upload, analyze
│   │       ├── actividades/   # CRUD actividades
│   │       ├── kpis/          # CRUD KPIs
│   │       ├── dashboard/     # Gerente, comparativa
│   │       ├── reportes/      # Generacion de reportes
│   │       └── settings/      # Configuracion org
│   ├── components/
│   │   ├── admin/             # Componentes administrativos
│   │   ├── ai/               # Componentes de IA
│   │   ├── dashboard/        # Widgets del dashboard
│   │   ├── layout/           # Sidebar, ThemeSelector, Header
│   │   └── ui/              # Componentes reutilizables
│   └── lib/
│       ├── auth/             # Configuracion NextAuth.js
│       ├── ai/              # Proveedores IA (Strategy Pattern)
│       │   ├── types.ts     # Interfaces AIProvider, AICapabilities
│       │   ├── providers/   # Gemini, Ollama, None
│       │   └── schemas/     # Zod schemas para structured output
│       ├── db/              # Cliente Prisma
│       ├── security/        # RBAC, rate limiter, audit log
│       ├── services/        # Document analyzer, helpers
│       └── utils/           # Utilidades generales
├── docs/                    # Documentacion del proyecto
└── package.json             # Dependencias y scripts
```

---

## 4. Sistema de Autenticacion

### 4.1 NextAuth.js v5

El sistema usa **NextAuth.js v5** (Auth.js) con estrategia JWT y proveedor de credenciales.

**Archivo:** `src/lib/auth/index.ts`

- **Estrategia de sesion:** JWT (sin base de datos de sesiones)
- **Proveedor:** Credentials (email + password)
- **Hash:** bcryptjs con salt rounds = 12
- **Paginas personalizadas:** `/login`, `/registro`

**Token JWT contiene:**
```typescript
{
  id: string;           // User ID
  role: Role;           // Rol del usuario
  organizationId: string; // ID de organizacion
  cargoId: string;      // ID de cargo
}
```

### 4.2 Middleware de Proteccion

**Archivo:** `src/middleware.ts`

Ejecuta en **Edge Runtime** (no puede usar Prisma ni modulos Node.js pesados). Verifica la presencia de la cookie de sesion:

- **Rutas publicas:** `/`, `/login`, `/registro`, `/api/auth/*`
- **Cookie buscada:** `authjs.session-token` o variantes con prefijo `__Secure-`
- **Sin cookie:** Redirige a `/login?callbackUrl={pathname}`

### 4.3 Autenticacion de Dos Factores (2FA)

**Endpoint:** `POST /api/auth/2fa/setup`

Implementacion TOTP usando `otplib`:
1. Genera secreto con `generateSecret()`
2. Construye URI otpauth con issuer "Incorporated"
3. Genera QR code como data URL (base64)
4. Almacena `twoFactorSecret` en User
5. Despues de verificacion, activa `twoFactorEnabled = true`

Compatible con Google Authenticator, Authy y cualquier app TOTP.

---

## 5. Sistema de Autorizacion (RBAC)

### 5.1 Jerarquia de Roles

**Archivo:** `src/lib/security/role-guard.ts`

| Rol | Nivel | Descripcion |
|-----|-------|-------------|
| SUPER_ADMIN | 100 | Control total del sistema |
| ADMIN | 80 | Administrador de organizacion |
| DIRECTOR | 60 | Director de area |
| JEFE_AREA | 40 | Jefe de area |
| JEFE_PROYECTO | 30 | Jefe de proyecto |
| COLABORADOR | 20 | Colaborador general |
| INDIVIDUAL | 10 | Usuario individual (modo personal) |

### 5.2 Funciones de Verificacion

```typescript
hasMinRole(userRole: string, minRole: Role): boolean
hasRole(userRole: string, allowedRoles: Role[]): boolean
canManageUser(managerRole: string, targetRole: string): boolean
```

### 5.3 Permisos Especificos

| Permiso | Rol Minimo |
|---------|-----------|
| canChangeAIProvider | ADMIN (80) |
| canManageOrg | ADMIN (80) |
| canInviteUsers | ADMIN (80) |
| canDeleteDocs | ADMIN (80) |
| canManageCargos | JEFE_AREA (40) |
| canApproveLineamientos | JEFE_AREA (40) |
| canViewAllDocs | COLABORADOR (20) |
| canUploadDocs | Todos (autenticados) |
| canUseAI | Todos (autenticados) |

---

## 6. Sistema de Inteligencia Artificial

### 6.1 Patron Strategy (Factory)

**Archivos:** `src/lib/ai/types.ts`, `src/lib/ai/providers/index.ts`

```typescript
function createAIProvider(providerName?: AIProviderName): AIProvider {
  switch (name) {
    case "gemini": return new GeminiProvider();
    case "ollama": return new OllamaProvider();
    case "none":
    default:       return new NoAIProvider();
  }
}
```

### 6.2 Interface AIProvider

```typescript
interface AIProvider {
  readonly name: AIProviderName;
  readonly capabilities: AICapabilities;
  chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string>;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  generateStructured<T>(prompt: string, schema: ZodType<T>, context?: RAGContext): Promise<T>;
  isAvailable(): Promise<boolean>;
}
```

### 6.3 Capacidades por Proveedor

| Capacidad | Gemini | Ollama | None |
|-----------|--------|--------|------|
| chat | true | true | false |
| embeddings | true | true | false |
| streaming | true | true | false |
| structuredOutput | true | false | false |
| maxTokens | 8192 | 4096 | 0 |

### 6.4 RAGContext

```typescript
interface RAGContext {
  chunks: { content: string; source: string; page?: number }[];
  cargoInfo?: {
    nombre: string;
    area: string;
    descripcion: string;
    reportaA?: string;
  };
}
```

---

## 7. Pipeline de Procesamiento de Documentos

### 7.1 Subida de Archivos

**Endpoint:** `POST /api/docs/upload`

| Formato | Soporte | Metodo de Extraccion |
|---------|---------|---------------------|
| DOCX/DOC | Activo | mammoth.extractRawText() |
| TXT | Activo | buffer.toString("utf-8") |
| MD | Activo | buffer.toString("utf-8") |
| PDF | Deshabilitado | pdf-parse problematico en serverless |
| XLSX/XLS | Parcial | Texto plano si es legible |

**Restricciones:** Tamano maximo 20 MB, texto minimo extraido 10 caracteres.

### 7.2 Analisis de Documentos (Pattern-Based)

**Archivo:** `src/lib/services/document-analyzer.ts`

Funciona **sin IA** en todos los modos. Usa:
- **Deteccion de verbos estrategicos:** potenciar, establecer, consolidar, fortalecer, incrementar, mejorar, optimizar, garantizar, implementar, desarrollar, promover, asegurar, reducir, etc.
- **Patrones de KPI:** nomenclatura, nombre, objetivo, formula, condiciones
- **Patrones de secciones:** perspectiva del cliente, perspectiva interna, plan estrategico, FODA
- **Deteccion de tipo:** PEI, FODA, MOF, POI, CMI/BSC

**Output:**
```typescript
interface DocumentAnalysis {
  objetivos: ExtractedObjective[];
  kpis: ExtractedKPI[];
  lineamientos: ExtractedLineamiento[];
  perspectivas: string[];
  resumen: string;
  metadata: { totalParagraphs: number; detectedSections: string[]; documentType: string; };
}
```

### 7.3 Generacion con IA (Lineamientos)

**Endpoint:** `POST /api/ai/lineamientos`

1. Obtiene documentos de la organizacion (max 5)
2. Prepara con `prepareForAI()` para reducir tokens (~50 paginas a ~2 paginas)
3. Limita contexto a ~4000 tokens
4. Usa `generateStructured()` con schema Zod `LineamientoGeneradoSchema`
5. Modelo: Gemini 2.0 Flash con structured output

---

## 8. Seguridad

### 8.1 Rate Limiting

**Archivo:** `src/lib/security/rate-limiter.ts`

Implementacion in-memory (por instancia serverless). Para produccion a escala se recomienda Redis (Upstash).

| Endpoint | Max Requests | Ventana |
|----------|-------------|---------|
| Login | 5 | 15 minutos |
| Registro | 3 | 1 hora |
| AI | 30 | 1 minuto |
| API General | 100 | 1 minuto |
| Upload | 10 | 1 minuto |

**Limpieza automatica:** cada 5 minutos se eliminan entradas expiradas del store.

### 8.2 Sanitizacion de Entrada

- `sanitizeText()`: Limpia texto de entrada con limite de caracteres
- Validacion con **Zod schemas** en todos los endpoints
- Limites de longitud en campos (email, name, organizationName)

### 8.3 Audit Logging

```typescript
auditLog(action: string, userId?: string, ip?: string, metadata?: object)
```

Acciones registradas: REGISTER, RATE_LIMITED, 2FA_ENABLED, LOGIN_FAILED.

### 8.4 Validacion de Archivos

- Extension verificada contra whitelist
- Tamano maximo 20MB
- Contenido validado despues de extraccion (minimo 10 chars)
- Formatos binarios rechazados si no son legibles

### 8.5 Proteccion CSRF

NextAuth.js v5 incluye proteccion CSRF automatica con tokens en cookies HttpOnly.

---

## 9. Base de Datos

### 9.1 PostgreSQL en Neon (Serverless)

- Proveedor: **Neon** (PostgreSQL serverless con connection pooling)
- ORM: **Prisma 5.x**
- Multi-tenant por `organization_id` en la mayoria de modelos
- Relaciones con `onDelete: Cascade` para limpieza automatica

### 9.2 Modelos Principales (13 modelos)

| Modelo | Tabla | Descripcion |
|--------|-------|-------------|
| Organization | organizations | Organizacion/tenant |
| User | users | Usuarios del sistema |
| Area | areas | Areas organizacionales (jerarquicas) |
| Cargo | cargos | Cargos/puestos de trabajo |
| Objetivo | objetivos | Objetivos estrategicos/operativos |
| KPI | kpis | Indicadores clave de rendimiento |
| OKR | okrs | Objectives & Key Results |
| Actividad | actividades | Actividades con maquina de estados |
| Document | documents | Documentos subidos |
| DocumentChunk | document_chunks | Fragmentos para RAG |
| OnboardingChecklist | onboarding_checklists | Checklist 30/60/90 dias |
| ChatSession | chat_sessions | Sesiones de chat IA |
| ChatMessage | chat_messages | Mensajes individuales |

### 9.3 Relaciones Clave

- Organization -> Users, Areas, Documents, Cargos (1:N)
- Area -> Cargos (1:N), Area self-reference (jerarquia)
- Cargo -> Users (1:N), Objetivos (1:N)
- User -> Objetivos (1:N), ChatSessions (1:N), Documents (1:N)
- Objetivo -> KPIs, Actividades, OKRs (1:N)
- Document -> DocumentChunks (1:N)
- ChatSession -> ChatMessages (1:N)

---

## 10. Referencia de API

### 10.1 Autenticacion

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/registro` | Registro de usuario | No |
| POST | `/api/auth/callback/credentials` | Login (NextAuth) | No |
| POST | `/api/auth/2fa/setup` | Configurar 2FA | Si |
| POST | `/api/auth/2fa/verify` | Verificar codigo 2FA | Si |
| GET | `/api/auth/session` | Obtener sesion actual | Si |
| POST | `/api/auth/signout` | Cerrar sesion | Si |

### 10.2 Documentos

| Metodo | Endpoint | Descripcion | Auth | Role Min |
|--------|----------|-------------|------|----------|
| POST | `/api/docs/upload` | Subir documento | Si | Todos |
| POST | `/api/docs/analyze` | Analizar documento | Si | Todos |
| GET | `/api/docs` | Listar documentos | Si | COLABORADOR |
| DELETE | `/api/docs/[id]` | Eliminar documento | Si | ADMIN |

### 10.3 Inteligencia Artificial

| Metodo | Endpoint | Descripcion | Auth | Requiere AI |
|--------|----------|-------------|------|-------------|
| POST | `/api/ai/chat` | Chat con asistente | Si | Si (chat) |
| POST | `/api/ai/lineamientos` | Generar lineamientos | Si | Si (structuredOutput) |

### 10.4 Objetivos y Actividades

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/api/objetivos` | Listar objetivos del usuario | Si |
| POST | `/api/objetivos` | Crear objetivo | Si |
| PATCH | `/api/actividades/[id]` | Cambiar estado actividad | Si |
| GET | `/api/actividades` | Listar actividades | Si |

### 10.5 KPIs

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/api/kpis` | Listar KPIs del usuario | Si |
| PATCH | `/api/kpis/[id]` | Actualizar valor actual | Si |

### 10.6 Dashboard

| Metodo | Endpoint | Descripcion | Auth | Role Min |
|--------|----------|-------------|------|----------|
| GET | `/api/dashboard` | Dashboard personal | Si | Todos |
| GET | `/api/dashboard/gerente` | Vista gerencial | Si | DIRECTOR |
| GET | `/api/dashboard/comparativa` | Comparativa multi-gestion | Si | Todos |

### 10.7 Reportes

| Metodo | Endpoint | Query Params | Auth | Role Min |
|--------|----------|-------------|------|----------|
| GET | `/api/reportes` | tipo=progreso/poa/kpis, gestion=2024 | Si | JEFE_AREA |

### 10.8 Configuracion

| Metodo | Endpoint | Descripcion | Auth | Role Min |
|--------|----------|-------------|------|----------|
| GET | `/api/settings` | Obtener config org | Si | ADMIN |
| PATCH | `/api/settings` | Actualizar config | Si | ADMIN |

---

## 11. Despliegue (Deploy)

### 11.1 Plataforma

- **Hosting:** Vercel (Serverless Functions + Edge Runtime)
- **Base de Datos:** Neon PostgreSQL (pool de conexiones serverless)

### 11.2 Variables de Entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexion PostgreSQL (Neon) | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Secreto para firmar JWT | (string aleatorio 32+ chars) |
| `NEXTAUTH_URL` | URL base de la aplicacion | `https://incorporated.vercel.app` |
| `AI_PROVIDER` | Proveedor IA por defecto | `gemini` / `ollama` / `none` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key de Google Gemini | `AIza...` |
| `OLLAMA_BASE_URL` | URL del servidor Ollama | `http://localhost:11434` |

### 11.3 Comandos de Build

```bash
pnpm install
npx prisma generate
npx next build
npx prisma db push
npx prisma db seed
```

### 11.4 Pipeline de Deploy (Vercel)

1. Push a `main` activa deploy automatico
2. `pnpm install` (cache de dependencias)
3. `prisma generate` (genera cliente)
4. `next build` (compila SSR + API routes)
5. Deploy a serverless functions + edge network

---

## 12. Entorno de Desarrollo

### 12.1 Requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ (local o Neon)

### 12.2 Setup Local

```bash
git clone https://github.com/[org]/incorporated.git
cd incorporated
pnpm install
cp .env.example .env
# Editar .env con credenciales
npx prisma generate
npx prisma db push
npx prisma db seed
pnpm dev
```

### 12.3 Scripts Disponibles

| Script | Comando | Descripcion |
|--------|---------|-------------|
| dev | `pnpm dev` | Servidor de desarrollo (hot reload) |
| build | `pnpm build` | Build de produccion |
| start | `pnpm start` | Iniciar servidor de produccion |
| lint | `pnpm lint` | Ejecutar ESLint |

---

## 13. Temas Visuales

**Archivo:** `src/components/layout/theme-selector.tsx`

6 temas visuales disponibles, almacenados en `localStorage`:

| ID | Nombre | Color Acento | Fondo |
|----|--------|-------------|-------|
| default | Default | #2563eb (azul) | bg-gray-50 |
| dark | Oscuro | #3b82f6 (azul claro) | bg-gray-900 |
| warm | Calido | #d97706 (naranja) | bg-orange-50 |
| green | Verde | #059669 (esmeralda) | bg-emerald-50 |
| purple | Violeta | #7c3aed (violeta) | bg-violet-50 |
| contrast | Contraste | #000000 (negro) | bg-yellow-50 |

Implementacion via CSS variable `--color-accent` y manipulacion DOM directa. Persistido en `localStorage` como `incorporated_theme`. MutationObserver reaplica en navegaciones client-side.

---

## 14. Notificaciones

El sistema genera notificaciones para:
- **Actividades vencidas:** cuando `plazoDias` se excede sin completar
- **KPIs en zona roja:** cuando `porcentaje < 50%`
- **Niveles de prioridad:** alta (vencida), media (por vencer), baja (informativa)

---

## 15. Multi-Gestion

El campo `gestion` en Objetivo permite separar trabajo por anio/periodo:
- Cada objetivo pertenece a una gestion (ej: "2024", "2025")
- Los reportes se filtran por gestion
- La comparativa muestra metricas entre gestiones
- El dashboard personal muestra la gestion actual por defecto
