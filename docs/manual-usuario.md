# Manual de Usuario - Incorporated

Guia paso a paso para utilizar todas las funcionalidades del sistema Incorporated.

---

## 1. Primeros Pasos

### 1.1 Acceso al Sistema

1. Abra su navegador web (Chrome, Firefox, Edge o Safari)
2. Ingrese la URL proporcionada por su administrador
3. Vera la pagina de inicio con las opciones de **Iniciar Sesion** y **Registrarse**

> **Nota:** Si es su primera vez, debera registrarse primero. Si su organizacion ya existe, solicite una invitacion al administrador.

---

## 2. Registro de Usuario

### 2.1 Modo Individual

Para usuarios que trabajan de forma independiente:

1. Haga clic en **"Registrarse"** en la pagina de inicio
2. Seleccione el modo **"Individual"**
3. Complete los campos:
   - **Nombre completo:** Su nombre (minimo 2 caracteres)
   - **Email:** Correo electronico valido (sera su usuario)
   - **Contrasena:** Minimo 8 caracteres
4. Haga clic en **"Crear cuenta"**
5. El sistema creara su cuenta con rol INDIVIDUAL

*[Captura de pantalla: Formulario de registro modo individual]*

### 2.2 Modo Enterprise (Organizacion)

Para crear una nueva organizacion:

1. Haga clic en **"Registrarse"**
2. Seleccione el modo **"Enterprise"**
3. Complete los campos:
   - **Nombre de la organizacion:** Nombre de su empresa
   - **Nombre completo:** Su nombre
   - **Email:** Correo corporativo
   - **Contrasena:** Minimo 8 caracteres
4. Haga clic en **"Crear cuenta"**
5. El sistema creara la organizacion y le asignara el rol ADMIN

*[Captura de pantalla: Formulario de registro modo enterprise]*

> **Limite:** Maximo 3 registros por hora desde la misma direccion IP.

---

## 3. Inicio de Sesion (Login)

1. En la pagina de login, ingrese:
   - **Email:** El correo con el que se registro
   - **Contrasena:** Su contrasena
2. Haga clic en **"Iniciar Sesion"**
3. Si tiene 2FA activado, se le pedira el codigo de 6 digitos
4. Sera redirigido al **Dashboard**

*[Captura de pantalla: Pagina de login]*

> **Nota:** Despues de 5 intentos fallidos en 15 minutos, su acceso sera bloqueado temporalmente.

---

## 4. Dashboard Principal

Al iniciar sesion, vera el dashboard con:

### 4.1 Tarjetas de Estadisticas

- **Total de Objetivos:** Cantidad de objetivos creados
- **Actividades Completadas:** Numero de actividades terminadas
- **Progreso General:** Porcentaje de avance global
- **KPIs Activos:** Indicadores en seguimiento

### 4.2 Lista de Actividades Recientes

Muestra las ultimas actividades con su estado actual:
- Pendiente (gris)
- En curso (azul)
- Terminado (verde)

### 4.3 Grafico de Progreso

Visualizacion del avance por objetivo con barras de progreso.

*[Captura de pantalla: Dashboard principal con estadisticas]*

---

## 5. Subida de Documentos

### 5.1 Acceder a la Biblioteca

1. En el menu lateral, haga clic en **"Biblioteca de Documentos"** (icono de documento)
2. Vera la lista de documentos ya cargados

### 5.2 Subir un Documento

1. Haga clic en el boton **"Subir Documento"**
2. Seleccione el **tipo de documento**:
   - **PEI:** Plan Estrategico Institucional
   - **FODA:** Analisis de Fortalezas, Oportunidades, Debilidades y Amenazas
   - **MOF:** Manual de Organizacion y Funciones
   - **POI:** Plan Operativo Institucional
   - **OTRO:** Cualquier otro documento
3. Haga clic en **"Seleccionar archivo"** o arrastre el archivo
4. Formatos soportados: **DOCX, TXT, MD** (maximo 20 MB)
5. Haga clic en **"Subir"**
6. El sistema extraera el texto automaticamente

*[Captura de pantalla: Dialogo de subida de documentos]*

> **Importante:** Los archivos PDF no estan soportados actualmente. Convierta su PDF a Word (.docx) antes de subirlo.

### 5.3 Opcion "Pegar Texto"

Si no tiene el archivo digital:
1. Haga clic en **"Pegar texto"**
2. Copie y pegue el contenido del documento
3. Asigne un nombre y tipo
4. Haga clic en **"Guardar"**

---

## 6. Construir Lineamientos - Modo Analisis por Patrones

Esta funcion funciona **sin necesidad de IA**, disponible para todos los usuarios.

### 6.1 Acceder

1. En el menu lateral, haga clic en **"Construir Lineamientos"** (icono de construccion)

### 6.2 Seleccionar Documentos

1. Vera la lista de documentos cargados en su organizacion
2. Seleccione uno o mas documentos para analizar
3. Haga clic en **"Analizar"**

### 6.3 Ver Resultados del Analisis

El sistema detectara automaticamente:
- **Objetivos Estrategicos:** Identificados por verbos como "potenciar", "fortalecer", "mejorar"
- **KPIs:** Detectados por patrones de nomenclatura, formula y condiciones
- **Lineamientos:** Agrupados por perspectivas (Cliente, Interna, Financiera)
- **Resumen:** Tipo de documento y estadisticas

### 6.4 Guardar Lineamientos

1. Revise los objetivos y KPIs detectados
2. Seleccione los que desea conservar
3. Haga clic en **"Guardar Seleccionados"**
4. Los objetivos se crearan en su perfil

*[Captura de pantalla: Resultados del analisis con objetivos detectados]*

---

## 7. Construir Lineamientos - Modo IA (Gemini)

Requiere que el administrador haya configurado un proveedor de IA (Gemini).

### 7.1 Requisitos Previos

- Tener al menos un documento cargado (PEI o FODA recomendado)
- Proveedor de IA configurado (Gemini)

### 7.2 Generar con IA

1. En la pagina "Construir Lineamientos", haga clic en **"Generar con IA"**
2. El sistema:
   - Tomara sus documentos cargados (maximo 5)
   - Los resumira para ahorrar tokens
   - Enviara a Gemini 2.0 Flash
3. Espere unos segundos mientras se genera

### 7.3 Revisar Resultado

La IA generara:
- 3 a 5 **objetivos estrategicos** basados en sus documentos
- 2-3 **KPIs medibles** por objetivo
- 3-5 **actividades** con plazo (30, 60 o 90 dias)
- **Plan de insercion** a 30/60/90 dias

### 7.4 Confirmar y Guardar

1. Revise cada objetivo generado
2. Modifique lo que considere necesario
3. Haga clic en **"Confirmar y Guardar"**

*[Captura de pantalla: Lineamientos generados por IA]*

> **Nota:** Si ve un error de "cuota agotada", la IA tiene un limite diario. Use el analisis por patrones como alternativa.

---

## 8. Gestion de Objetivos

### 8.1 Ver Mis Objetivos

1. En el menu lateral, haga clic en **"Objetivos y Metas"** (icono de diana)
2. Vera todos sus objetivos con:
   - Titulo y descripcion
   - Tipo (Estrategico/Operativo)
   - Estado actual
   - Gestion/periodo al que pertenece

### 8.2 Estados de un Objetivo

Los objetivos pasan por estos estados:
- **BORRADOR:** Recien creado
- **PENDIENTE_APROBACION:** Enviado para revision
- **APROBADO:** Aprobado por un superior
- **EN_PROGRESO:** Al menos una actividad iniciada
- **COMPLETADO:** Todas las actividades terminadas

> **Nota:** El estado se actualiza automaticamente cuando completa actividades.

*[Captura de pantalla: Lista de objetivos con estados]*

---

## 9. Gestion de Actividades

### 9.1 Ver Mis Actividades

1. En el menu lateral, haga clic en **"Mis Actividades"** (icono de check)
2. Vera todas las actividades agrupadas por objetivo

### 9.2 Cambiar Estado de una Actividad

Las actividades tienen 3 estados posibles:

| Estado | Significado | Color |
|--------|------------|-------|
| Pendiente | No iniciada | Gris |
| En curso | En progreso | Azul |
| Terminado | Completada | Verde |

**Para cambiar el estado:**
1. Ubique la actividad en la lista
2. Haga clic en el boton de estado
3. Seleccione el nuevo estado: **"En curso"** o **"Terminado"**
4. El sistema:
   - Actualizara la actividad
   - Recalculara el progreso del objetivo padre
   - Si todas las actividades estan terminadas, marcara el objetivo como COMPLETADO

*[Captura de pantalla: Actividad con botones de cambio de estado]*

### 9.3 Prioridades

Cada actividad tiene una prioridad:
- **Alta:** Tareas urgentes
- **Media:** Tareas normales
- **Baja:** Tareas que pueden esperar

---

## 10. Seguimiento de KPIs

### 10.1 Ver Mis KPIs

1. En el menu lateral, haga clic en **"Mis KPIs"** (icono de grafico)
2. Vera los indicadores con su estado actual

### 10.2 Actualizar Valor de un KPI

1. Ubique el KPI que desea actualizar
2. Haga clic en **"Actualizar valor"**
3. Ingrese el valor actual (numerico)
4. Haga clic en **"Guardar"**

### 10.3 Sistema de Semaforo

El semaforo indica el nivel de cumplimiento:

| Color | Porcentaje | Significado |
|-------|-----------|-------------|
| Verde | >= 75% | Cumplimiento satisfactorio |
| Amarillo | >= 50% | Atencion requerida |
| Rojo | < 50% | Alerta - accion inmediata |

**Calculo:** `porcentaje = (valorActual / meta) * 100`

*[Captura de pantalla: Dashboard de KPIs con semaforos]*

---

## 11. Asistente IA (Chat)

### 11.1 Acceder al Asistente

1. En el menu lateral, haga clic en **"Asistente IA"** (icono de chat)

### 11.2 Realizar Consultas

1. Escriba su pregunta en el campo de texto
2. Presione Enter o haga clic en **"Enviar"**
3. El asistente respondera basandose en el contexto de su organizacion
4. Puede hacer preguntas de seguimiento

**Ejemplos de consultas:**
- "Como puedo mejorar mi KPI de satisfaccion del cliente?"
- "Que actividades deberia priorizar esta semana?"
- "Resume los objetivos estrategicos de mi area"

*[Captura de pantalla: Interfaz del chat con el asistente]*

> **Nota:** Si el asistente no esta disponible, significa que la IA no esta configurada. Contacte a su administrador.

---

## 12. Checklist de Onboarding (30/60/90 dias)

### 12.1 Acceder al Checklist

1. En el menu lateral, haga clic en **"Checklist Onboarding"** (icono de lista)
2. Vera un plan de insercion dividido en 3 etapas

### 12.2 Etapas

- **Primeros 30 dias:** Familiarizacion con el cargo y la organizacion
- **30-60 dias:** Inicio de gestion de objetivos
- **60-90 dias:** Consolidacion y autonomia

### 12.3 Completar Items

1. Marque cada item conforme lo vaya completando
2. El progreso se actualizara automaticamente
3. Su avance es visible para su supervisor

*[Captura de pantalla: Checklist con items y barra de progreso]*

---

## 13. Panel de Administracion - Equipo y Avance

> **Disponible para:** ADMIN, DIRECTOR, SUPER_ADMIN, JEFE_AREA

### 13.1 Acceder

1. En el menu lateral, seccion "ORGANIZACION", haga clic en **"Equipo y Avance"** (icono de personas)

### 13.2 Vista de Empleados

Vera una tabla con todos los empleados de su organizacion:
- Nombre y cargo
- Total de objetivos
- Actividades completadas / en curso / pendientes
- Progreso general (porcentaje)
- KPIs activos

### 13.3 Resumen Organizacional

En la parte superior:
- **Total de empleados** activos
- **Progreso promedio** de la organizacion
- **Total de objetivos** creados
- **Objetivos completados** en toda la org

*[Captura de pantalla: Panel gerencial con tabla de empleados]*

---

## 14. Estructura Organizacional

> **Disponible para:** ADMIN, SUPER_ADMIN, DIRECTOR

### 14.1 Gestionar Areas

1. Vaya a **"Estructura"** en la seccion ORGANIZACION
2. Vera el arbol de areas con su jerarquia
3. Puede:
   - Crear nuevas areas
   - Asignar directores
   - Definir areas padre/hijo

### 14.2 Gestionar Cargos

1. Dentro de cada area, defina los cargos
2. Para cada cargo especifique:
   - Nombre del cargo
   - Descripcion
   - Competencias requeridas
   - A quien reporta

### 14.3 Asignar Usuarios

1. Asigne usuarios a cargos existentes
2. El cargo determina sus objetivos y checklist de onboarding

*[Captura de pantalla: Estructura organizacional con areas y cargos]*

---

## 15. Reportes

> **Disponible para:** JEFE_AREA o superior

### 15.1 Acceder a Reportes

1. En el menu lateral, haga clic en **"Reportes"** (icono de documento)

### 15.2 Tipos de Reportes

#### Reporte de Progreso
- Muestra avance general por objetivo
- Incluye: estado, responsable, porcentaje de actividades
- Resumen: total de objetivos, completados, en progreso

#### Reporte POA (Plan Operativo Anual)
- Cumplimiento del plan operativo
- Detalle por objetivo: completadas, en curso, pendientes
- Porcentaje de cumplimiento

#### Reporte de KPIs
- Estado de todos los indicadores
- Semaforo por KPI (verde/amarillo/rojo)
- Resumen: total KPIs, verdes, amarillos, rojos

### 15.3 Filtrar por Gestion

1. Seleccione la **gestion** (anio) que desea consultar
2. Los datos se filtraran automaticamente
3. Puede seleccionar "Todas" para ver el historico completo

*[Captura de pantalla: Reporte de KPIs con semaforos y filtro de gestion]*

---

## 16. Configuracion de Seguridad - 2FA

### 16.1 Activar Autenticacion en Dos Pasos

1. Vaya a **"Configuracion"** en el menu lateral
2. Busque la seccion **"Seguridad"**
3. Haga clic en **"Activar Autenticacion en 2 Pasos"**

### 16.2 Escanear Codigo QR

1. Aparecera un codigo QR en pantalla
2. Abra su app de autenticacion:
   - **Google Authenticator** (recomendado)
   - **Authy**
   - Cualquier app compatible con TOTP
3. Escanee el codigo QR con la app

### 16.3 Guardar Codigo de Respaldo

1. El sistema mostrara un **codigo secreto** (texto)
2. **Guardelo en un lugar seguro** - es su codigo de respaldo
3. Si pierde acceso a su telefono, necesitara este codigo

### 16.4 Verificar

1. Ingrese el codigo de 6 digitos que muestra su app
2. Haga clic en **"Verificar"**
3. Si el codigo es correcto, 2FA se activara

*[Captura de pantalla: QR code de configuracion 2FA]*

> **Importante:** A partir de ahora, cada vez que inicie sesion se le pedira un codigo de 6 digitos ademas de su contrasena.

---

## 17. Selector de Temas

### 17.1 Cambiar Tema Visual

1. En la barra superior, haga clic en el icono de **paleta** (circulo de color)
2. Aparecera un panel con 6 opciones

### 17.2 Temas Disponibles

| Tema | Descripcion | Ideal para |
|------|------------|-----------|
| **Default** | Azul clasico, fondo claro | Uso general |
| **Oscuro** | Fondo oscuro, texto claro | Trabajo nocturno |
| **Calido** | Tonos naranjas suaves | Lectura prolongada |
| **Verde** | Tonos esmeraldas | Ambiente natural |
| **Violeta** | Tonos purpura | Preferencia estetica |
| **Contraste** | Negro sobre amarillo | Accesibilidad visual |

3. Haga clic en el tema deseado
4. El cambio se aplica inmediatamente
5. Su preferencia se recuerda para futuras sesiones

*[Captura de pantalla: Panel de seleccion de temas]*

---

## 18. Notificaciones

### 18.1 Ver Notificaciones

1. En el menu lateral, haga clic en **"Notificaciones"** (icono de campana)
2. Vera la lista de alertas del sistema

### 18.2 Tipos de Notificaciones

| Tipo | Prioridad | Descripcion |
|------|-----------|-------------|
| Actividad vencida | Alta | Una actividad supero su plazo sin completarse |
| KPI en rojo | Alta | Un indicador esta por debajo del 50% |
| Actividad por vencer | Media | Una actividad esta proxima a su fecha limite |
| Objetivo actualizado | Baja | Un objetivo cambio de estado |

### 18.3 Acciones

- Las notificaciones de alta prioridad se resaltan en rojo
- Haga clic en una notificacion para ir directamente al elemento relacionado
- Las notificaciones se generan automaticamente basandose en plazos y valores de KPI

*[Captura de pantalla: Centro de notificaciones con alertas]*

---

## 19. Comparativa Multi-Gestion

### 19.1 Acceder a la Comparativa

1. En el **Dashboard**, busque la seccion **"Comparativa entre Gestiones"**
2. O acceda directamente desde el enlace en el dashboard

### 19.2 Interpretar los Datos

La comparativa muestra lado a lado las metricas de diferentes anios:

| Metrica | Descripcion |
|---------|-------------|
| Total Objetivos | Objetivos creados en esa gestion |
| Objetivos Completados | Cuantos se terminaron |
| Total Actividades | Actividades planificadas |
| Actividades Terminadas | Completadas exitosamente |
| Progreso General | Porcentaje de avance |

### 19.3 Analizar Tendencias

- Compare el **progreso general** entre gestiones
- Identifique si la productividad mejora o disminuye
- Use los datos para planificar la siguiente gestion

*[Captura de pantalla: Grafico comparativo entre gestiones 2023 vs 2024]*

---

## 20. Vista Dual de Gerente

> **Disponible para:** ADMIN, DIRECTOR, SUPER_ADMIN

### 20.1 Que es la Vista Dual

La vista dual permite a los gerentes ver simultaneamente:
- **Su propio progreso** (como empleado)
- **El progreso de su equipo** (como gerente)

### 20.2 Acceder

1. En el Dashboard, los roles administrativos veran automaticamente ambas vistas
2. La seccion superior muestra su progreso personal
3. La seccion inferior muestra el equipo

### 20.3 Funcionalidades del Gerente

- Ver el progreso de cada empleado
- Identificar empleados con bajo rendimiento
- Ver el promedio organizacional
- Filtrar por area o cargo

*[Captura de pantalla: Dashboard dual con vista personal y de equipo]*

---

## Preguntas Frecuentes (FAQ)

### No puedo subir mi PDF
Los archivos PDF no estan soportados actualmente en el servidor. Convierta su PDF a Word (.docx) usando un convertidor en linea o copie el texto y use la opcion "Pegar texto".

### El asistente IA no responde
El asistente requiere que un proveedor de IA este configurado (Gemini u Ollama). Si ve un mensaje indicando que no esta configurado, contacte a su administrador para que lo active en Configuracion.

### Olvide mi contrasena
Contacte a su administrador para que restablezca su contrasena manualmente.

### No veo ciertas opciones en el menu
Las opciones del menu dependen de su rol. Si necesita acceso a funciones adicionales, solicite un cambio de rol a su administrador.

### Mi KPI esta en rojo pero el valor es correcto
Verifique que la **meta** del KPI este configurada correctamente. El semaforo se calcula como (valorActual / meta) * 100. Si la meta es incorrecta, contacte a quien genero los lineamientos.

### Se agoto la cuota de IA
La API de Gemini tiene limites diarios gratuitos. Use el analisis por patrones (sin IA) que no tiene limite. La cuota se restablece al dia siguiente.

---

## Atajos y Consejos

- **Navegacion rapida:** Use el menu lateral para moverse entre secciones
- **Tema oscuro:** Ideal para trabajar en ambientes con poca luz
- **Analisis sin IA:** Siempre disponible, sin limites de uso
- **Checklist:** Completelo gradualmente, no es obligatorio terminar todo de una vez
- **Documentos:** Suba documentos antes de usar "Construir Lineamientos" para mejores resultados
