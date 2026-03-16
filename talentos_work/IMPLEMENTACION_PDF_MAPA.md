# Implementación: PDF del Mapa de Talentos con HTML + Puppeteer

## Problema original

El PDF del mapa de talentos usaba `@vercel/og` (ImageResponse) para generar el diagrama, pero:
- Renderizado incompleto o con errores visuales
- No se veía igual que la vista previa en el admin
- Limitaciones de estilo y layout

## Solución implementada

**HTML primero, luego PDF** usando Puppeteer:

1. **Endpoint HTML** (`/api/mapa-html/[id]`) - genera HTML completo con estilos inline
2. **Puppeteer** - captura el HTML renderizado y lo convierte a PDF
3. **chrome-aws-lambda** - compatibilidad con entorno serverless de Vercel

## Archivos modificados/creados

### 1. `package.json`
```json
"puppeteer-core": "^23.11.1",
"chrome-aws-lambda": "^10.1.0"
```

### 2. `app/api/mapa-html/[id]/route.tsx` (NUEVO)
- Genera HTML completo del mapa de talentos
- Estilos CSS inline para renderizado consistente
- Grid de 4 columnas con tarjetas de talentos
- Sección de detalle por talento
- Usa misma lógica y colores que componente visual

### 3. `lib/puppeteer.ts` (NUEVO)
```typescript
export async function getBrowser() // Inicializa Chrome en serverless
export async function generatePDFFromURL(url: string) // HTML URL → PDF
export async function generatePDFFromHTML(html: string) // HTML string → PDF
```

### 4. `app/api/pdf/mapa/[id]/route.tsx` (REEMPLAZADO)
**Antes:**
- Usaba `@react-pdf/renderer`
- Llamaba a `/api/diagram/[id]` para imagen
- Renderizado limitado

**Ahora:**
- Llama a `/api/mapa-html/[id]`
- Usa Puppeteer para HTML → PDF
- Márgenes: 1.5cm en todos los lados
- Formato A4
- `printBackground: true` para colores

### 5. `vercel.json` (NUEVO)
```json
{
  "functions": {
    "app/api/pdf/**/*": {
      "maxDuration": 60
    }
  },
  "build": {
    "env": {
      "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
    }
  }
}
```

## Ventajas

✅ **Renderizado idéntico** - El PDF se ve exactamente como el HTML  
✅ **CSS completo** - Grid, Flexbox, borders, shadows, todo funciona  
✅ **Mantenimiento** - Un único código HTML para preview y PDF  
✅ **Escalable** - Fácil aplicar mismo patrón al informe completo  
✅ **Serverless-ready** - chrome-aws-lambda optimizado para Vercel  

## Uso

**Vista HTML previa:**
```
GET /api/mapa-html/[id]
```

**Descargar PDF:**
```
GET /api/pdf/mapa/[id]
```

## Próximos pasos

- [ ] Aplicar mismo patrón al informe completo (`/api/pdf/informe/[id]`)
- [ ] Optimizar caché de generación PDF (costos Puppeteer)
- [ ] Añadir previsualización HTML del informe

## Despliegue

1. Vercel detectará cambios automáticamente
2. `npm install` instalará nuevas dependencias
3. `chrome-aws-lambda` se descargará en build time
4. Función PDF tendrá 60s timeout (configurado en vercel.json)

## Testing local

```bash
npm install
npm run dev
```

**Nota:** En desarrollo local, Puppeteer necesita Chrome instalado. Si falla:
```bash
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

O usa la vista HTML directamente para desarrollo:
```
http://localhost:3000/api/mapa-html/[id]
```

---

**Implementado:** 2 marzo 2026  
**Stack:** Next.js 16 + Puppeteer + chrome-aws-lambda + Vercel
