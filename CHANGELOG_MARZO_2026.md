# Changelog - Marzo 2026

## 2 de marzo de 2026

### ✅ Cambios implementados en el cuestionario

#### Títulos y subtítulos del mapa de resultados
- **Título principal**: "Descubre tu futuro"
- **Subtítulo**: "Cómo piensas, cómo sientes, cómo aprendes"
- **"Perfil profesional"**: Incorporado en todos los resúmenes de talentos para consistencia

#### Preguntas actualizadas

**Pregunta 6.1 (Creatividad/FI - Talento T6)**
- **Texto anterior**: (pregunta original sobre creatividad)
- **Texto nuevo**: "Me interesa la práctica deportiva de élite profesional"
- **Nueva profesión asociada**: Deporte de élite profesional
- **Justificación**: Ampliar el espectro de opciones profesionales para incluir el alto rendimiento deportivo

**Pregunta 7.5 (Introspección/THETA - Talento T7)**
- **Texto anterior**: (pregunta original sobre introspección)
- **Texto nuevo**: "Me interesa el arte neo-gótico, gore, la estética dark y los tatuajes"
- **Nueva profesión asociada**: Arte alternativo y tatuaje profesional
- **Justificación**: Incluir expresiones artísticas contemporáneas y nichos profesionales emergentes

### 🐛 Errores de compilación corregidos

#### Error #1: TypeScript JSX configuration
- **Archivo**: `tsconfig.json`
- **Problema**: `jsx: "react-jsx"` incompatible con Next.js
- **Solución**: Cambiado a `jsx: "preserve"`

#### Error #2: Estilos CSS en react-pdf
- **Archivo**: `components/PDFReport.tsx`
- **Problema**: Uso de estilos CSS abreviados no soportados por react-pdf
- **Solución**: Convertido a formato numérico (ej: `margin: 10` en lugar de `margin: "10px"`)

#### Error #3: Variables de entorno Prisma
- **Archivos**: `prisma.config.ts`, `schema.prisma`
- **Problema**: Uso de `DIRECT_URL` no definida en el entorno
- **Solución**: Cambio a `DATABASE_URL` con fallback por defecto

#### Error #4: Prisma 7 configuration
- **Archivo**: `prisma/schema.prisma`
- **Problema**: Prisma 7 no permite `url = env("DATABASE_URL")` en datasource
- **Solución**: Eliminada la línea; URL ahora solo se define en `prisma.config.ts`

#### Error #5: JSX en archivo .ts
- **Archivo**: `app/api/generate-pdf/route.ts`
- **Problema**: JSX (`<PDFReport />`) no permitido en archivos `.ts`
- **Solución**: Renombrado a `route.tsx`

### 🚀 Panel de administración mejorado

#### Nuevas funcionalidades agregadas

**Descarga masiva de PDFs**
- Endpoint: `/api/admin/download-all`
- Genera un archivo ZIP con todos los PDFs de los estudiantes filtrados
- Respeta los filtros activos (género, curso, modalidad, centro, etc.)
- Límite: 100 estudiantes por descarga
- Formato de archivo: `talentos_YYYY-MM-DD.zip`

**Estadísticas agregadas**
- Endpoint: `/api/admin/stats`
- Métricas disponibles:
  - Total de estudiantes
  - Estudiantes con/sin assessment completado
  - Distribución por género
  - Distribución por curso
  - Distribución por modalidad
  - Top talentos más frecuentes (talento dominante por estudiante)
- Respeta los filtros activos del panel

**Interfaz mejorada**
- Botón "Descargar ZIP con PDFs" agregado al header del panel admin
- Botón "Ver estadísticas" agregado para consultar métricas en tiempo real
- Ambos botones respetan los filtros aplicados

### ⚠️ Acción requerida en producción

**Configurar DATABASE_URL en Vercel**
1. Ir a Vercel Dashboard → Proyecto "talentos" → Settings → Environment Variables
2. Añadir `DATABASE_URL` con la connection string de Neon
3. Marcar para **Production**, **Preview** y **Development**
4. Redesplegar la aplicación

**Sin esta configuración, la aplicación no funcionará en producción**, aunque el código esté correcto.

### 📦 Resumen de archivos modificados

```
├── tsconfig.json (jsx config)
├── components/PDFReport.tsx (estilos react-pdf)
├── prisma/schema.prisma (Prisma 7 config)
├── prisma.config.ts (DATABASE_URL)
├── app/api/generate-pdf/route.tsx (rename .ts → .tsx)
├── app/admin/page.tsx (nuevos hrefs para ZIP y stats)
├── app/admin/AdminClient.tsx (botones descarga y stats)
├── app/api/admin/stats/route.ts (estadísticas agregadas)
└── CHANGELOG_MARZO_2026.md (este archivo)
```

### 🎯 Estado actual del proyecto

✅ **Completado hoy**:
- Preguntas 6.1 y 7.5 actualizadas
- Título y subtítulo del mapa actualizados
- "Perfil profesional" incorporado
- Todos los errores de compilación corregidos
- Panel de administración con descarga masiva
- Endpoint de estadísticas agregadas
- Documentación completa

⏳ **Pendiente** (futuras iteraciones):
- Autenticación y roles de usuario (admin/profesor/estudiante)
- Filtros avanzados por rango de fechas
- Exportación de estadísticas en PDF
- Dashboard de visualización de métricas con gráficos

---

**Documentado por**: Sistema automatizado  
**Fecha**: 2 de marzo de 2026  
**Rama**: `mejoras-ux-cuestionario`  
