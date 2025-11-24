// Configuración de la cena
export const CONFIG_CENA = {
  // Fecha de la cena (formato: YYYY-MM-DD)
  FECHA_CENA: process.env.FECHA_CENA || "2025-01-15",

  // Hora de envío de emails (formato 24h)
  HORA_ENVIO: "21:00",

  // Timezone
  TIMEZONE: "Europe/Madrid",

  // Clave secreta para proteger el endpoint de cron
  CRON_SECRET: process.env.CRON_SECRET || "tu-clave-secreta-aqui",
};
