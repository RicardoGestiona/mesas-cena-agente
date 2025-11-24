# 🎉 Sistema de Sorteo de Mesas - Cena de Gala

Aplicación web para organizar el sorteo de ubicaciones en una cena de 400 comensales en 40 mesas de 10 personas cada una.

## ✨ Características

- **Sorteo 100% aleatorio** de ubicaciones usando algoritmo Fisher-Yates
- **400 comensales** generados con datos realistas (nombres españoles)
- **40 mesas** de 10 personas distribuidas en formato 8x5
- **Búsqueda de ubicación** por nombre y email
- **Visualización interactiva:**
  - Croquis completo de la sala con todas las mesas
  - Vista de mesa redonda con asientos numerados
  - Lista de compañeros de mesa
- **Envío automático de email** al consultar tu ubicación (solo la primera vez)
- **Diseño moderno** con gradientes, glassmorphism y animaciones

## 🚀 Stack Tecnológico

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Resend** (emails)
- **Lucide React** (iconos)

## 📦 Instalación

```bash
# Clonar e instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores

# Desarrollo
npm run dev

# Build producción
npm run build
npm start
```

## 🎯 Uso

### 1. Acceder a la aplicación

Abre http://localhost:3000 en tu navegador.

### 2. Consultar ubicación

1. Haz clic en "Ver ejemplos de comensales" para ver la lista
2. Ingresa nombre y email de un comensal
3. La aplicación ejecutará el sorteo automáticamente la primera vez
4. Verás tu mesa, asiento, croquis y compañeros

### 3. Emails automáticos

Los emails se envían automáticamente el día de la cena a las 21:00.

Ver documentación completa en [CRON_SETUP.md](./CRON_SETUP.md)

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                    # Página principal
│   ├── layout.tsx                  # Layout global
│   ├── globals.css                 # Estilos globales
│   └── api/
│       ├── buscar/                 # Buscar comensal
│       ├── comensales/             # Listar comensales
│       ├── sorteo/                 # Ejecutar sorteo
│       ├── enviar-email/           # Enviar email individual
│       └── enviar-emails-masivo/   # Envío masivo programado
├── components/
│   ├── SalaCroquis.tsx            # Visualización sala completa
│   ├── MesaCroquis.tsx            # Visualización mesa redonda
│   ├── CompanerosList.tsx         # Lista de compañeros
│   └── EjemplosComensales.tsx     # Lista de ejemplos
├── lib/
│   ├── data.ts                    # Lógica de datos y sorteo
│   └── utils.ts                   # Utilidades
└── types/
    └── index.ts                   # Tipos TypeScript
```

## 🔧 Configuración

### Variables de Entorno

```env
# Resend API Key (obtener en https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**Nota:** Sin `RESEND_API_KEY`, el sistema funciona en modo simulación (muestra logs pero no envía emails reales).

## 📧 Sistema de Emails

### Funcionamiento

**El email se envía automáticamente** cuando un comensal consulta su ubicación por primera vez:

1. Usuario busca su nombre y email
2. Sistema encuentra su ubicación
3. **Automáticamente se envía un email** con toda la información
4. Si el mismo usuario consulta de nuevo, no se reenvía (control de duplicados)

**Solo reciben email los comensales que consultan su ubicación.** Si alguien no consulta (porque no asiste o ya vio su ubicación en otro medio), no recibe email.

### Contenido del Email

Cada comensal recibe:
- Saludo personalizado con su nombre
- Número de mesa y asiento
- Croquis ASCII de la sala con su mesa resaltada
- Lista completa de compañeros de mesa con sus asientos

### Configuración de Resend

1. Crear cuenta en https://resend.com
2. Verificar dominio (opcional, usar `onboarding@resend.dev` para pruebas)
3. Obtener API key
4. Configurar `RESEND_API_KEY` en variables de entorno

**Sin API key:** El sistema simula el envío y muestra logs en consola.

## 🧪 Testing

### Test local de búsqueda

```bash
curl -X POST http://localhost:3000/api/buscar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María","email":"maria.garcia1@email.com"}'
```

### Test de envío masivo (simulado)

```bash
curl -X POST http://localhost:3000/api/enviar-emails-masivo \
  -H "Authorization: Bearer tu-clave-secreta"
```

### Ver comensales de ejemplo

```bash
curl http://localhost:3000/api/comensales
```

## 📊 Datos Generados

### Comensales

- **400 comensales** con nombres y apellidos españoles
- Emails únicos: `nombre.apellidoN@email.com`
- Generación determinista (mismos datos en cada ejecución)

### Mesas

- **40 mesas** numeradas del 1 al 40
- Capacidad: 10 personas por mesa
- Distribución: 8 columnas × 5 filas

### Sorteo

- Algoritmo: Fisher-Yates shuffle
- 100% aleatorio y justo
- Se ejecuta automáticamente en el primer uso

## 🎨 Diseño

- **Color scheme:** Gradientes morado-rosa sobre fondo oscuro
- **Glassmorphism:** Efectos de vidrio translúcido
- **Responsive:** Mobile-first design
- **Animaciones:** Transiciones suaves y micro-interactions
- **Accesibilidad:** Contraste adecuado y navegación por teclado

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configurar variables de entorno en Vercel Dashboard:
- Settings → Environment Variables
- Añadir: `RESEND_API_KEY`, `FECHA_CENA`, `CRON_SECRET`

### Otros proveedores

Compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform

**Nota:** Para cron jobs en otras plataformas, ver alternativas en [CRON_SETUP.md](./CRON_SETUP.md)

## 📝 Notas Importantes

1. **Generación de datos:** Los 400 comensales se generan en memoria. Para persistencia real, integrar con Supabase o base de datos.

2. **Rate limiting:** Resend tiene límites de envío. El plan gratuito permite 100 emails/día.

3. **Zona horaria:** El cron usa UTC. Ajusta según tu ubicación.

4. **Testing de emails:** Usa el modo simulado antes de enviar emails reales.

5. **Sorteo único:** El sorteo se ejecuta una vez. Para re-sortear, reiniciar la aplicación o llamar a `/api/sorteo`.

## 🐛 Troubleshooting

### No encuentra comensales
→ Verifica que el email sea exacto (puedes copiar desde la lista de ejemplos)

### Emails no se envían
→ Verifica `RESEND_API_KEY` y que la fecha coincida con `FECHA_CENA`

### Error 404 en API
→ Reinicia el servidor: `npm run dev`

### Build error
→ Verifica TypeScript: `npm run build`

## 📄 Licencia

MIT

## 🤝 Contribuciones

Pull requests bienvenidos. Para cambios mayores, abre un issue primero.

---

**¡Disfruta de tu cena! 🎊**
