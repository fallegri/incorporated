# Diagramas de Secuencia - Incorporated

Diagramas de secuencia Mermaid que representan los flujos principales del sistema Incorporated.

---

## 1. Registro de Usuario (Modo Enterprise e Individual)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/registro)
    participant API as POST /api/auth/registro
    participant RL as RateLimiter
    participant SEC as Sanitizer
    participant DB as PostgreSQL (Neon)

    U->>FE: Completa formulario (email, password, name, mode, orgName)
    FE->>API: POST { email, password, name, mode, organizationName }
    API->>RL: checkRateLimit("registro:{ip}", 3/hora)
    alt Rate limit excedido
        RL-->>API: allowed: false
        API->>API: auditLog("RATE_LIMITED")
        API-->>FE: 429 "Demasiados intentos"
    end
    RL-->>API: allowed: true
    API->>API: Validar con Zod (RegistroSchema)
    alt Datos invalidos
        API-->>FE: 400 "Datos invalidos" + issues
    end
    API->>SEC: sanitizeText(name, orgName)
    SEC-->>API: Texto limpio
    API->>DB: findUnique({ email })
    alt Email ya existe
        DB-->>API: user encontrado
        API-->>FE: 409 "Este email ya esta registrado"
    end
    DB-->>API: null (no existe)
    API->>API: hash(password, 12) con bcryptjs
    API->>DB: $transaction: crear Organization + User
    Note over DB: mode=enterprise -> role=ADMIN<br/>mode=individual -> role=INDIVIDUAL
    DB-->>API: { user, org }
    API->>API: auditLog("REGISTER", userId, ip)
    API-->>FE: 201 { message, userId, organizationId }
    FE-->>U: Redirigir a /login
```

---

## 2. Login con 2FA Opcional

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/login)
    participant NA as NextAuth.js v5
    participant DB as PostgreSQL
    participant TOTP as Verificacion TOTP

    U->>FE: Ingresa email + password
    FE->>NA: signIn("credentials", { email, password })
    NA->>DB: findUnique({ email }) include: organization
    alt Usuario no existe o inactivo
        DB-->>NA: null / isActive=false
        NA-->>FE: Error "Credenciales invalidas"
    end
    DB-->>NA: user (con passwordHash)
    NA->>NA: compare(password, passwordHash) con bcryptjs
    alt Password incorrecto
        NA-->>FE: Error "Credenciales invalidas"
    end
    alt 2FA habilitado (twoFactorEnabled=true)
        NA-->>FE: Requiere codigo 2FA
        FE-->>U: Mostrar campo codigo TOTP
        U->>FE: Ingresa codigo de 6 digitos
        FE->>TOTP: Verificar token con twoFactorSecret
        alt Codigo invalido
            TOTP-->>FE: Error "Codigo invalido"
        end
        TOTP-->>FE: Valido
    end
    NA->>NA: Generar JWT { id, role, organizationId, cargoId }
    NA-->>FE: Session creada (cookie authjs.session-token)
    FE-->>U: Redirigir a /dashboard
```

---

## 3. Subida de Documentos (Document Upload)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/documentos)
    participant API as POST /api/docs/upload
    participant AUTH as auth() Session
    participant MM as mammoth (Word)
    participant DB as PostgreSQL

    U->>FE: Selecciona archivo + tipo (PEI/FODA/MOF/POI/OTRO)
    FE->>API: POST FormData { file, type }
    API->>AUTH: Verificar sesion
    alt No autenticado
        AUTH-->>API: null
        API-->>FE: 401 "No autenticado"
    end
    AUTH-->>API: session { user.organizationId }
    API->>API: Validar tamano (max 20MB)
    API->>API: Detectar extension del archivo
    alt Formato PDF
        API-->>FE: 400 "PDF temporalmente no soportado"
    end
    alt Formato DOCX/DOC
        API->>MM: extractRawText({ buffer })
        MM-->>API: textContent
    end
    alt Formato TXT/MD
        API->>API: buffer.toString("utf-8")
    end
    alt Texto extraido < 10 caracteres
        API-->>FE: 400 "No se pudo extraer texto"
    end
    API->>DB: document.create({ name, type, format, rawText, status:READY, orgId, uploadedById })
    DB-->>API: document creado
    API-->>FE: 201 { id, name, type, format, contentLength, message }
    FE-->>U: Mostrar documento en biblioteca
```

---

## 4. Analisis de Documentos (Pattern-Based sin IA)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/construir)
    participant API as POST /api/docs/analyze
    participant AUTH as auth()
    participant DA as DocumentAnalyzer
    participant AI as AIProvider Factory

    U->>FE: Selecciona documentos y presiona "Analizar"
    FE->>API: POST { text, documentName }
    API->>AUTH: Verificar sesion
    AUTH-->>API: session valida
    API->>API: Validar texto (minimo 50 caracteres)
    API->>DA: analyzeDocument(text, documentName)
    Note over DA: Deteccion de patrones:<br/>1. detectSections()<br/>2. extractObjectives() - verbos estrategicos<br/>3. extractKPIs() - nomenclatura/formula<br/>4. extractLineamientos() - perspectivas<br/>5. detectPerspectives()<br/>6. detectDocumentType()
    DA-->>API: DocumentAnalysis { objetivos, kpis, lineamientos, perspectivas, resumen, metadata }
    API->>AI: createAIProvider()
    alt AI disponible con structuredOutput
        AI-->>API: aiEnhanced = true
    else AI no disponible
        AI-->>API: aiEnhanced = false
    end
    API-->>FE: { ...analysis, aiEnhanced, message }
    FE-->>U: Mostrar objetivos, KPIs y lineamientos detectados
```

---

## 5. Generacion de Lineamientos con IA (Gemini)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/construir)
    participant API as POST /api/ai/lineamientos
    participant AUTH as auth()
    participant DB as PostgreSQL
    participant PREP as prepareForAI()
    participant AI as GeminiProvider

    U->>FE: Click "Generar con IA"
    FE->>API: POST (sin body)
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.id, organizationId, cargoId }
    API->>AI: createAIProvider()
    alt Provider sin structuredOutput
        AI-->>API: capabilities.structuredOutput = false
        API-->>FE: 400 "Requiere proveedor configurado"
    end
    API->>DB: document.findMany({ orgId, rawText != null, take: 5 })
    alt No hay documentos
        DB-->>API: []
        API-->>FE: 400 "No hay documentos cargados"
    end
    DB-->>API: documents[]
    loop Para cada documento (max ~4000 tokens)
        API->>PREP: prepareForAI(rawText, docName)
        PREP-->>API: { markdown, estimatedTokens }
    end
    API->>DB: cargo.findUnique({ cargoId })
    DB-->>API: cargo { name, description }
    API->>AI: generateStructured(prompt, LineamientoGeneradoSchema, context)
    Note over AI: Gemini 2.0 Flash<br/>Structured Output con Zod Schema<br/>3-5 objetivos + KPIs + actividades
    alt Cuota agotada (429)
        AI-->>API: Error quota
        API-->>FE: 429 "Cuota de IA agotada"
    end
    AI-->>API: result (validado por Zod)
    API-->>FE: { ...result, _meta: { documentsUsed, tokensEstimated, model } }
    FE-->>U: Mostrar lineamientos generados para revision
```

---

## 6. Asistente IA - Chat (RAG Flow)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/asistente)
    participant API as POST /api/ai/chat
    participant AUTH as auth()
    participant AI as AIProvider

    U->>FE: Escribe pregunta en chat
    FE->>API: POST { message, history[] }
    API->>AUTH: Verificar sesion
    AUTH-->>API: session valida
    API->>API: Validar mensaje (string no vacio)
    API->>AI: createAIProvider()
    alt Chat no disponible
        AI-->>API: capabilities.chat = false
        API-->>FE: { response: "IA no configurada..." }
    end
    API->>API: Construir messages[] (ultimos 4 de historial + mensaje actual)
    API->>AI: provider.chat(messages)
    loop AsyncIterable - streaming
        AI-->>API: chunk de texto
        API->>API: fullResponse += chunk
    end
    API-->>FE: { response: fullResponse }
    FE-->>U: Mostrar respuesta del asistente
```

---

## 7. Maquina de Estados de Actividades

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/actividades)
    participant API as PATCH /api/actividades/[id]
    participant AUTH as auth()
    participant DB as PostgreSQL

    U->>FE: Cambiar estado de actividad
    FE->>API: PATCH { estado: "en_curso" | "terminado" }
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.id }
    API->>API: Validar estado in ["pendiente", "en_curso", "terminado"]
    API->>DB: actividad.findFirst({ id, objetivo.userId })
    alt Actividad no encontrada
        DB-->>API: null
        API-->>FE: 404 "Actividad no encontrada"
    end
    DB-->>API: actividad { objetivoId }
    API->>DB: actividad.update({ estado, completada, completadaAt })
    Note over DB: estado="terminado" -> completada=true, completadaAt=now<br/>otros -> completada=false, completadaAt=null
    DB-->>API: updated
    API->>DB: actividad.findMany({ objetivoId }) - todas las actividades hermanas
    DB-->>API: allActivities[]
    API->>API: Calcular progreso (completadas/total)
    alt Todas completadas
        API->>DB: objetivo.update({ estado: "COMPLETADO" })
    else Alguna en progreso o completada
        API->>DB: objetivo.update({ estado: "EN_PROGRESO" })
    end
    API-->>FE: { id, estado, completada, progreso: {completadas, total, porcentaje}, objetivoEstado }
    FE-->>U: Actualizar UI con nuevo estado y progreso
```

---

## 8. Actualizacion de KPI con Semaforo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/kpis)
    participant API as PATCH /api/kpis/[id]
    participant AUTH as auth()
    participant DB as PostgreSQL
    participant FE2 as Frontend (calculo semaforo)

    U->>FE: Ingresa nuevo valor actual del KPI
    FE->>API: PATCH { valorActual: "85" }
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.id }
    API->>API: Validar valorActual presente
    API->>DB: kpi.findFirst({ id, objetivo.userId })
    alt KPI no encontrado
        DB-->>API: null
        API-->>FE: 404 "KPI no encontrado"
    end
    DB-->>API: kpi { id, nombre, meta }
    API->>DB: kpi.update({ valorActual: String(valorActual) })
    DB-->>API: updated { id, nombre, valorActual, meta }
    API-->>FE: { id, nombre, valorActual, meta, message }
    FE->>FE2: Calcular semaforo
    Note over FE2: porcentaje = (actual / meta) * 100<br/>verde: >= 75%<br/>amarillo: >= 50%<br/>rojo: < 50%
    FE2-->>U: Mostrar KPI con color semaforo actualizado
```

---

## 9. Vista Gerente (Dashboard Administrativo)

```mermaid
sequenceDiagram
    participant U as Gerente/Admin
    participant FE as Frontend (/admin)
    participant API as GET /api/dashboard/gerente
    participant AUTH as auth()
    participant DB as PostgreSQL

    U->>FE: Accede a panel de equipo
    FE->>API: GET /api/dashboard/gerente
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.role, organizationId }
    API->>API: Verificar role in [SUPER_ADMIN, ADMIN, DIRECTOR]
    alt Role no autorizado
        API-->>FE: 403 "Solo gerentes y administradores"
    end
    API->>DB: user.findMany({ organizationId, isActive }) include: cargo, objetivos, actividades, kpis
    DB-->>API: employees[]
    loop Para cada empleado
        API->>API: Calcular metricas
        Note over API: totalObjetivos, objetivosCompletados<br/>totalActividades, completadas, enCurso<br/>progresoGeneral = (completadas/total)*100
    end
    API->>API: Calcular resumen organizacional
    Note over API: totalEmpleados, progresoPromedio<br/>totalObjetivos, objetivosCompletados
    API-->>FE: { resumen: {...}, empleados: [...] }
    FE-->>U: Mostrar tabla de empleados con progreso y resumen
```

---

## 10. Comparativa Multi-Gestion (Year-over-Year)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (Dashboard Comparativa)
    participant API as GET /api/dashboard/comparativa
    participant AUTH as auth()
    participant DB as PostgreSQL

    U->>FE: Accede a seccion comparativa
    FE->>API: GET /api/dashboard/comparativa
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.id }
    API->>DB: objetivo.findMany({ userId }) include: actividades, kpis
    DB-->>API: allObjetivos[]
    API->>API: Agrupar por gestion (campo "gestion" o "2024" por defecto)
    loop Para cada gestion
        API->>API: Calcular metricas
        Note over API: totalObjetivos, objetivosCompletados<br/>totalActividades, terminadas, enCurso, pendientes<br/>totalKpis<br/>progresoGeneral = (terminadas/total)*100
    end
    API->>API: Ordenar por anio (sort localeCompare)
    API-->>FE: { gestiones: [ { gestion, totalObjetivos, progresoGeneral, ... } ] }
    FE-->>U: Mostrar grafico comparativo entre gestiones
```

---

## 11. Generacion de Reportes

```mermaid
sequenceDiagram
    participant U as Jefe/Admin
    participant FE as Frontend (/reportes)
    participant API as GET /api/reportes
    participant AUTH as auth()
    participant RBAC as hasMinRole()
    participant DB as PostgreSQL

    U->>FE: Selecciona tipo de reporte y gestion
    FE->>API: GET /api/reportes?tipo=kpis&gestion=2024
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.role, organizationId }
    API->>RBAC: hasMinRole(role, "JEFE_AREA")
    alt Role insuficiente (< nivel 40)
        RBAC-->>API: false
        API-->>FE: 403 "No autorizado"
    end
    RBAC-->>API: true
    API->>DB: objetivo.findMany({ orgId, gestion }) include: actividades, kpis, user, cargo
    DB-->>API: objetivos[]
    alt tipo = "progreso"
        API->>API: Calcular progreso por objetivo
        API-->>FE: { tipo, gestion, resumen: {total, completados, enProgreso, %}, objetivos[] }
    end
    alt tipo = "poa"
        API->>API: Calcular cumplimiento POA
        API-->>FE: { tipo, gestion, objetivos: [{cumplimiento: {total, completadas, enCurso, pendientes, %}}, ...] }
    end
    alt tipo = "kpis"
        API->>API: Calcular semaforo por KPI
        Note over API: porcentaje = (actual/meta)*100<br/>verde >= 75%, amarillo >= 50%, rojo < 50%
        API-->>FE: { tipo, gestion, resumen: {total, verdes, amarillos, rojos}, kpis[] }
    end
    FE-->>U: Mostrar reporte con graficos y tablas
```

---

## 12. Configuracion 2FA (TOTP)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (Configuracion)
    participant API as POST /api/auth/2fa/setup
    participant AUTH as auth()
    participant OTP as otplib (generateSecret)
    participant QR as QRCode
    participant DB as PostgreSQL

    U->>FE: Click "Activar Autenticacion en 2 Pasos"
    FE->>API: POST /api/auth/2fa/setup
    API->>AUTH: Verificar sesion
    AUTH-->>API: session { user.id, user.email }
    API->>OTP: generateSecret()
    OTP-->>API: secret (base32)
    API->>OTP: generateURI({ issuer: "Incorporated", label: email, secret })
    OTP-->>API: otpauth://totp/...
    API->>QR: QRCode.toDataURL(otpauth)
    QR-->>API: qrCode (data URL base64)
    API->>DB: user.update({ twoFactorSecret: secret })
    DB-->>API: OK
    API->>API: auditLog("2FA_ENABLED", userId, step: "setup")
    API-->>FE: { qrCode, secret, message }
    FE-->>U: Mostrar QR code + codigo de respaldo
    Note over U: Escanear con Google Authenticator o Authy
    U->>FE: Ingresa codigo de verificacion (6 digitos)
    FE->>API: POST /api/auth/2fa/verify { token }
    API->>API: Verificar token contra secret
    alt Token valido
        API->>DB: user.update({ twoFactorEnabled: true })
        API-->>FE: { success: true }
    else Token invalido
        API-->>FE: { error: "Codigo invalido" }
    end
    FE-->>U: 2FA activado exitosamente
```

---

## 13. Middleware de Autenticacion

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant MW as Middleware (Edge Runtime)
    participant Page as Pagina Protegida

    Browser->>MW: Request a /dashboard
    MW->>MW: Verificar pathname
    alt Ruta publica (/, /login, /registro, /api/auth/*)
        MW-->>Browser: NextResponse.next() - acceso permitido
    end
    MW->>MW: Buscar cookie de sesion
    Note over MW: Busca en orden:<br/>1. authjs.session-token<br/>2. __Secure-authjs.session-token<br/>3. next-auth.session-token<br/>4. __Secure-next-auth.session-token
    alt Cookie no encontrada
        MW-->>Browser: Redirect a /login?callbackUrl=/dashboard
    end
    MW-->>Page: NextResponse.next() - continuar
    Page-->>Browser: Renderizar pagina protegida
```

---

## 14. Flujo Completo: Construir Lineamientos (Vista Unificada)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (/construir)
    participant UPLOAD as POST /api/docs/upload
    participant ANALYZE as POST /api/docs/analyze
    participant AI_GEN as POST /api/ai/lineamientos
    participant DB as PostgreSQL

    U->>FE: Accede a "Construir Lineamientos"
    FE-->>U: Mostrar opciones: Subir documento / Pegar texto

    rect rgb(230, 240, 255)
        Note over U,DB: Paso 1 - Cargar Documento
        U->>FE: Sube archivo DOCX con plan estrategico
        FE->>UPLOAD: POST FormData { file, type: "PEI" }
        UPLOAD->>DB: Guardar documento con rawText
        UPLOAD-->>FE: { id, contentLength }
    end

    rect rgb(230, 255, 230)
        Note over U,DB: Paso 2 - Analisis por Patrones
        U->>FE: Click "Analizar documentos"
        FE->>ANALYZE: POST { text, documentName }
        ANALYZE-->>FE: { objetivos[], kpis[], lineamientos[], resumen }
        FE-->>U: Mostrar resultados del analisis
    end

    rect rgb(255, 240, 230)
        Note over U,DB: Paso 3 (Opcional) - Generar con IA
        U->>FE: Click "Generar con IA"
        FE->>AI_GEN: POST
        AI_GEN->>DB: Obtener documentos de la organizacion
        AI_GEN-->>FE: { objetivos[], kpis[], actividades[], plan_insercion }
        FE-->>U: Mostrar lineamientos generados por IA
    end

    U->>FE: Confirmar y guardar lineamientos seleccionados
    FE->>DB: Crear Objetivos, KPIs y Actividades
    DB-->>FE: Entidades creadas
    FE-->>U: Redirigir a /objetivos
```
