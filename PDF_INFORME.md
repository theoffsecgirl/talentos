# Sistema de Informes PDF - Cuestionario de Talentos

## 📝 Descripción general

Sistema de generación automática de informes PDF para las devoluciones con los estudiantes. Cada PDF incluye toda la información necesaria para la sesión de orientación.

---

## 📦 Contenido del informe PDF

### **Página 1: Datos y Top 3 Talentos**

#### 1. **Cabecera del informe**
- Título: "Informe de Talentos"
- Subtítulo: "Orientación Profesional basada en Neurociencia Aplicada"
- Fecha de generación del informe

#### 2. **Datos del estudiante**
- Nombre completo
- Correo electrónico
- Fecha de nacimiento
- Género
- Curso
- Modalidad (Ciencias/Letras/FP)
- Centro educativo (si lo proporcionó)

#### 3. **Idea inicial de carrera**
- Si el estudiante tenía una idea previa, se muestra aquí
- Permite comparar expectativas vs resultados

#### 4. **Top 3 Talentos Destacados**
Para cada talento:
- **Número de ranking** (#1, #2, #3)
- **Nombre del talento** (ej: "Estrategia y comunicación")
- **Porcentaje** en grande y destacado
- **Resumen descriptivo** (1-2 frases explicativas)
- **Barra de progreso visual** para rápida comparación

---

### **Página 2: Mapa Completo y Profesiones**

#### 5. **Mapa Visual de Talentos (Roscón)**
- **Grid de 8 talentos** mostrando distribución completa
- Cada talento incluye:
  - Nombre abreviado
  - Porcentaje alcanzado
- Diseño compacto en rejilla de 4x2
- Permite ver el perfil completo de un vistazo

#### 6. **Profesiones Seleccionadas**
- Lista de profesiones que el estudiante eligió de las sugerencias
- Formato de lista con bullets
- Si no seleccionó ninguna, se indica

#### 7. **Profesiones Personalizadas** ⭐ **IMPORTANTE**

**Sección destacada en amarillo** con:
- 🎯 Título: "Aspiraciones profesionales propias del estudiante"
- Campo de texto libre donde el estudiante escribió sus profesiones de interés
- **Ejemplos típicos**:
  - "Tengo Control y Resultados pero quiero ser futbolista profesional"
  - "Me sale Imaginación pero mi sueño es mecánico de alta competición"
  - "Quiero ser piloto de avión comercial"

**¿Por qué es importante?**
- Muestra lo que **realmente piensa** el estudiante
- Puede no coincidir con los resultados del test
- Esencial para la conversación en la devolución
- Permite identificar brechas entre talento y aspiración

#### 8. **Interpretación de Resultados**
- Texto explicativo sobre cómo leer el informe
- Nota sobre la validez de las aspiraciones personales
- Orientación para el orientador

---

## 🛠️ Cómo funciona

### **1. En el cuestionario**

El estudiante:
1. Completa las 40 preguntas del cuestionario
2. Ve sus resultados en la pantalla (mapa circular + top 3)
3. **Puede descargar el PDF en ese momento** (botón en pantalla de resultados)
4. Continúa con el registro
5. En la pantalla de profesiones:
   - Selecciona profesiones de las listas sugeridas (basadas en sus top 3)
   - **Escribe libremente otras profesiones** en el campo de texto
6. Finaliza y guarda

### **2. Generación del PDF**

**Endpoint**: `POST /api/generate-pdf`

**Entrada**:
```json
{
  "nombre": "María",
  "apellido": "García López",
  "email": "maria@ejemplo.com",
  "fechaNacimiento": "2008-05-15",
  "genero": "Femenino",
  "curso": "1º Bachillerato",
  "modalidad": "Ciencias",
  "centroEducativo": "IES Miguel Hernández",
  "scores": [
    { "talentId": 1, "score": 38, "max": 15 },
    { "talentId": 2, "score": 35, "max": 15 },
    ...
  ],
  "selectedCareers": [
    "Medicina y especialidades médicas",
    "Psicología clínica"
  ],
  "customCareers": "Quiero ser futbolista profesional, aunque sé que tengo talento para medicina. También me interesa entrenador deportivo.",
  "ideaCarreraTexto": "Medicina"
}
```

**Salida**:
- Archivo PDF descargable
- Nombre: `informe-talentos-maria-garcia-lopez.pdf`

### **3. Para las devoluciones**

Antes de la sesión con cada estudiante:

1. **Accede al panel de admin** (próximo paso a implementar)
2. **Busca al estudiante** por nombre o email
3. **Descarga su PDF** o géneralo en ese momento
4. **Revisa el informe**:
   - ¿ Cuáles son sus top 3?
   - ¿ Qué profesiones seleccionó de la lista?
   - ⭐ **¿Qué escribió en "Profesiones personalizadas"?**
5. **Prepara la conversación**:
   - Si hay alineación: reforzar y profundizar
   - Si hay brecha: explorar motivaciones y expectativas realistas

---

## 💡 Casos de uso

### **Caso 1: Alineación perfecta**

**Resultados**:
- Top 1: Estrategia y comunicación (85%)
- Top 2: Analítico y riguroso (78%)
- Top 3: Imaginación y creatividad (72%)

**Profesiones seleccionadas**:
- Ingeniería informática
- Desarrollo de software
- Arquitectura de sistemas

**Profesiones personalizadas**:
- "Diseño de videojuegos, programación de IA"

✅ **Interpretación**: Excelente alineación. Reforzar y explorar opciones concretas.

---

### **Caso 2: Brecha talento-aspiración**

**Resultados**:
- Top 1: Acompañamiento y docencia (82%)
- Top 2: Vocación de servicio (79%)
- Top 3: Aplicado y cooperador (71%)

**Profesiones seleccionadas**:
- Trabajo social
- Enfermería

**Profesiones personalizadas**:
- "Quiero ser mecánico de F1. Sé que no sale en mis resultados pero es mi sueño desde pequeño."

⚠️ **Interpretación**: Brecha importante. Conversación necesaria:
- ¿Qué aspectos le atraen de la mecánica de F1?
- ¿Ha considerado mecánica + gestión de equipos?
- ¿Podría combinar su talento de servicio en ese ámbito?

---

### **Caso 3: Sin idea clara**

**Resultados**:
- Top 1: Imaginación y creatividad (76%)
- Top 2: Profundo e introspectivo (74%)
- Top 3: Estrategia y comunicación (68%)

**Profesiones seleccionadas**:
- (ninguna)

**Profesiones personalizadas**:
- "No tengo ni idea de qué hacer. Me gusta dibujar y escribir pero no sé si se puede vivir de eso."

🔍 **Interpretación**: Necesita exploración y referentes. Mostrar opciones concretas:
- Diseño gráfico, ilustración
- Escritura creativa, guionismo
- Publicidad y marketing creativo
- Diseño de experiencias (UX/UI)

---

## 📊 Datos guardados en BD

El campo `campoIdentificado` en la base de datos incluye:

```sql
-- Si seleccionó "Medicina" de la lista Y escribió "Futbolista"
campoIdentificado = "Medicina y especialidades médicas, [PERSONALIZADO] Futbolista profesional"

-- Si solo escribió texto personalizado
campoIdentificado = "[PERSONALIZADO] Quiero ser piloto de avión"

-- Si solo seleccionó de la lista
campoIdentificado = "Ingeniería informática, Desarrollo de software"
```

El prefijo `[PERSONALIZADO]` permite identificar rápidamente las aspiraciones escritas por el estudiante.

---

## 🚀 Mejoras futuras

### **Pendientes de implementar**:

1. **Panel de administración**
   - Lista de todos los estudiantes
   - Filtros por curso, centro, fecha
   - Botón "Descargar PDF" por estudiante
   - Vista previa de resultados

2. **Descarga masiva**
   - Generar PDFs de toda una clase
   - ZIP con todos los informes
   - Para preparar devoluciones en bloque

3. **Personalización del PDF**
   - Logo del centro educativo
   - Nombre del orientador
   - Notas adicionales del orientador

4. **Estadísticas agregadas**
   - Talentos más comunes por grupo
   - Profesiones más demandadas
   - Tendencias y patrones

---

## 📝 Ejemplo de uso en devolución

**Orientador preparando la sesión**:

```
1. Descargo el PDF de Juan Pérez
2. Veo que tiene:
   - Top 1: Gestión y organización (84%)
   - Top 2: Estrategia y comunicación (79%)
   - Profesiones seleccionadas: Project Manager, Consultoría
   - Profesiones personalizadas: "Streamer de Twitch y creador de contenido"

3. Preparación:
   - Su perfil encaja perfecto para Project Manager
   - PERO su aspiración es ser streamer
   - Estrategia: Explorar cómo sus talentos de gestión y comunicación
     pueden aplicarse a la creación de contenido
   - Posible camino: Community Manager, Social Media Manager, 
     Productor de contenido digital
   - Esto combina sus talentos naturales con su pasión

4. En la sesión:
   - "Veo que te interesa mucho el mundo del streaming..."
   - "Tus resultados muestran que tienes talento para organizar
      y comunicar. ¿Sabías que los streamers exitosos necesitan
      exactamente esas habilidades para gestionar su comunidad,
      planificar contenido y negociar colaboraciones?"
   - Resultado: Juan ve cómo sus talentos pueden ayudarle a
     alcanzar su sueño de forma realista
```

---

## 🔧 Implementación técnica

### **Archivos clave**:

1. `src/components/PDFReport.tsx` - Componente React-PDF con el diseño
2. `app/api/generate-pdf/route.ts` - Endpoint de generación
3. `app/start/page.tsx` - Botón de descarga y campo de texto personalizado

### **Tecnologías**:
- `@react-pdf/renderer` - Generación de PDFs con React
- Next.js API Routes - Backend
- Streaming de archivos - Descarga directa sin guardar en servidor

### **Flujo de datos**:
```
Usuario completa cuestionario
  ↓
Presiona "Descargar PDF"
  ↓
Frontend envía datos a /api/generate-pdf
  ↓
Backend calcula percentiles y genera PDF
  ↓
PDF se descarga automáticamente en el navegador
```

---

## ✅ Checklist de uso

**Para el orientador antes de cada devolución**:

- [ ] Descargar PDF del estudiante
- [ ] Revisar top 3 talentos
- [ ] Leer profesiones seleccionadas
- [ ] **Leer con atención las profesiones personalizadas**
- [ ] Identificar alineación o brechas
- [ ] Preparar preguntas abiertas
- [ ] Tener ejemplos concretos de profesiones intermedias
- [ ] Investigar opciones realistas para aspiraciones personalizadas

---

**Última actualización**: 2 de marzo de 2026  
**Estado**: ✅ Implementado y funcional  
**Rama**: `mejoras-ux-cuestionario`
