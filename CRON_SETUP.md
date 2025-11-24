# 📧 Configuración de Envío Automático de Emails

Este documento explica cómo configurar el envío automático de emails el día de la cena a las 21:00.

## 🎯 Funcionamiento

El sistema enviará automáticamente un email a cada comensal el día de la cena a las 21:00 con:
- Su número de mesa y asiento
- Croquis de la ubicación de la mesa en la sala
- Lista de compañeros de mesa con sus nombres y asientos

## ⚙️ Configuración

### 1. Variables de entorno

Crea un archivo `.env.local` basado en `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Configura las siguientes variables:

```env
# API Key de Resend (obtener en https://resend.com)
RESEND_API_KEY=re_tu_api_key_real

# Fecha de la cena (formato YYYY-MM-DD)
FECHA_CENA=2025-01-15

# Clave secreta para proteger el endpoint (genera una aleatoria)
CRON_SECRET=genera-una-clave-aleatoria-muy-segura-aqui
```

**Importante:** En Resend necesitas:
1. Crear una cuenta en https://resend.com
2. Verificar tu dominio (o usar el de prueba `onboarding@resend.dev`)
3. Obtener tu API key en el dashboard

### 2. Deployment en Vercel

#### Opción A: Vercel Cron (Recomendado)

El archivo `vercel.json` ya está configurado para ejecutar el cron automáticamente:

```json
{
  "crons": [
    {
      "path": "/api/enviar-emails-masivo",
      "schedule": "0 21 * * *"
    }
  ]
}
```

**Pasos:**

1. Deploy tu aplicación en Vercel:
   ```bash
   vercel --prod
   ```

2. En el dashboard de Vercel:
   - Ve a tu proyecto → Settings → Environment Variables
   - Añade `RESEND_API_KEY`, `FECHA_CENA` y `CRON_SECRET`

3. En tu proyecto → Cron Jobs:
   - Verifica que el cron esté activo
   - Se ejecutará automáticamente a las 21:00 (UTC) cada día
   - **Nota:** El cron usa UTC. Si quieres 21:00 hora española (CET/CEST):
     - En invierno (CET): configura `0 20 * * *` (20:00 UTC = 21:00 CET)
     - En verano (CEST): configura `0 19 * * *` (19:00 UTC = 21:00 CEST)

4. Añade también `VERCEL_CRON_SECRET` en las variables de entorno:
   - Vercel automáticamente añade un header `authorization` con este valor
   - Debes configurar `CRON_SECRET` con el mismo valor

#### Opción B: Servicio de Cron Externo

Si no usas Vercel, puedes usar servicios como:

**EasyCron, cron-job.org, o similar:**

1. Configura un job que haga POST a:
   ```
   https://tu-dominio.com/api/enviar-emails-masivo
   ```

2. Añade el header:
   ```
   Authorization: Bearer tu-clave-secreta-aqui
   ```

3. Programa para las 21:00 del día de la cena

### 3. Testing

#### Test 1: Verificar configuración (GET)

```bash
curl http://localhost:3000/api/enviar-emails-masivo
```

Respuesta esperada:
```json
{
  "total_comensales": 400,
  "comensales_asignados": 400,
  "fecha_cena_configurada": "2025-01-15",
  "hora_envio_configurada": "21:00"
}
```

#### Test 2: Simular envío (sin API key)

```bash
curl -X POST http://localhost:3000/api/enviar-emails-masivo \
  -H "Authorization: Bearer tu-clave-secreta-aqui"
```

Si no tienes `RESEND_API_KEY`, simulará el envío.

#### Test 3: Envío real (día de la cena)

El día configurado en `FECHA_CENA`, el endpoint enviará los emails reales.

Para probar antes, cambia temporalmente `FECHA_CENA` al día actual:
```bash
FECHA_CENA=2024-12-26 # Fecha de hoy
```

## 🔒 Seguridad

- El endpoint requiere un header `Authorization: Bearer <CRON_SECRET>`
- Solo funciona el día configurado en `FECHA_CENA`
- En producción, el endpoint GET está deshabilitado

## 📊 Monitoreo

### Logs de Vercel

En Vercel → Tu proyecto → Logs, verás:
- Inicio del cron job
- Número de emails enviados exitosamente
- Número de emails fallidos
- Primeros 10 errores (si hay)

### Respuesta del endpoint

```json
{
  "success": true,
  "emails_enviados": 398,
  "emails_fallidos": 2,
  "total_comensales": 400,
  "errores": [
    "email@invalido.com: Invalid email address"
  ],
  "fecha_envio": "2025-01-15T21:00:00.000Z"
}
```

## ⚠️ Consideraciones importantes

1. **Rate Limiting:** Resend tiene límites:
   - Plan gratuito: 100 emails/día
   - Plan Pro: 50,000 emails/mes
   - Para 400 emails necesitas al menos el plan Pro ($20/mes)

2. **Timing:** El script incluye una pausa de 100ms entre emails para evitar rate limiting

3. **Errores:** Si un email falla, el script continúa con el resto

4. **Testing:** No pruebes el envío masivo real hasta estar seguro. Usa el modo simulado primero.

5. **Dominio verificado:** Para enviar desde tu dominio, debes verificarlo en Resend. Mientras tanto, usa `onboarding@resend.dev`

## 🆘 Troubleshooting

### "No autorizado"
→ Verifica que el header `Authorization` coincida con `CRON_SECRET`

### "Hoy no es el día de la cena"
→ Verifica que `FECHA_CENA` esté configurada correctamente

### "Missing API key"
→ Añade `RESEND_API_KEY` a las variables de entorno

### Emails no llegan
→ Verifica:
- Dominio verificado en Resend
- Email no está en spam
- Revisa los logs de Resend dashboard

## 📞 Soporte

- Resend Docs: https://resend.com/docs
- Vercel Cron Docs: https://vercel.com/docs/cron-jobs
