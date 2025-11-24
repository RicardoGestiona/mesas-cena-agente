import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getComensales, getMesas, getCompanerosMesa } from "@/lib/data";
import { CONFIG_CENA } from "@/../../config";

export async function POST(request: NextRequest) {
  try {
    // Verificar clave secreta para seguridad
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CONFIG_CENA.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que hoy es el día de la cena
    const hoy = new Date().toISOString().split("T")[0];
    if (hoy !== CONFIG_CENA.FECHA_CENA) {
      return NextResponse.json(
        {
          error: "Hoy no es el día de la cena",
          fecha_actual: hoy,
          fecha_cena: CONFIG_CENA.FECHA_CENA
        },
        { status: 400 }
      );
    }

    // Verificar API key de Resend
    if (!process.env.RESEND_API_KEY) {
      console.log("Simulando envío masivo (sin API key)");
      const comensales = getComensales();
      return NextResponse.json({
        success: true,
        simulated: true,
        emails_enviados: comensales.length,
        mensaje: "Emails simulados (configurar RESEND_API_KEY para envío real)"
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const comensales = getComensales();
    const mesas = getMesas();

    let exitosos = 0;
    let fallidos = 0;
    const errores: string[] = [];

    // Enviar email a cada comensal
    for (const comensal of comensales) {
      if (!comensal.mesa_id || !comensal.asiento) {
        console.log(`Comensal ${comensal.id} sin mesa asignada, saltando...`);
        fallidos++;
        continue;
      }

      const mesa = mesas.find(m => m.id === comensal.mesa_id);
      if (!mesa) {
        console.log(`Mesa ${comensal.mesa_id} no encontrada`);
        fallidos++;
        continue;
      }

      const companeros = getCompanerosMesa(comensal.mesa_id, comensal.id);

      // Generar croquis ASCII de la sala
      const filas = 5;
      const columnas = 8;
      let croquisSala = "ESCENARIO\n";
      croquisSala += "═".repeat(columnas * 4) + "\n\n";

      for (let f = 0; f < filas; f++) {
        let fila = "";
        for (let c = 0; c < columnas; c++) {
          const numMesa = f * columnas + c + 1;
          if (numMesa === mesa.numero) {
            fila += `[${numMesa.toString().padStart(2, "0")}]`;
          } else {
            fila += ` ${numMesa.toString().padStart(2, "0")} `;
          }
        }
        croquisSala += fila + "\n";
      }
      croquisSala += "\n" + "═".repeat(columnas * 4) + "\n";
      croquisSala += "         ↑ ENTRADA";

      // HTML del email
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #fbbf24; margin: 0; }
          .info-box { background: #0f3460; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
          .highlight { color: #fbbf24; font-weight: bold; font-size: 24px; }
          .croquis { background: #000; color: #10b981; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre; overflow-x: auto; }
          .companeros { list-style: none; padding: 0; margin: 0; }
          .companeros li { padding: 8px 0; border-bottom: 1px solid #0f3460; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Cena de Gala ✨</h1>
            <p>Esta noche es la gran cena</p>
          </div>

          <div class="info-box" style="text-align: center;">
            <p>Hola <strong>${comensal.nombre} ${comensal.apellido}</strong>,</p>
            <p>Tu ubicación es:</p>
            <p class="highlight">Mesa ${mesa.numero} - Asiento ${comensal.asiento}</p>
          </div>

          <div class="info-box">
            <h3 style="color: #fbbf24; margin-top: 0;">📍 Ubicación de tu mesa en la sala</h3>
            <div class="croquis">${croquisSala}</div>
          </div>

          <div class="info-box">
            <h3 style="color: #fbbf24; margin-top: 0;">👥 Tus compañeros de mesa</h3>
            <ul class="companeros">
              ${companeros
                .sort((a, b) => (a.asiento || 0) - (b.asiento || 0))
                .map(c => `<li><strong>${c.nombre} ${c.apellido}</strong> - Asiento ${c.asiento}</li>`)
                .join("")}
            </ul>
          </div>

          <div class="footer">
            <p>¡Disfruta de esta noche inolvidable!</p>
          </div>
        </div>
      </body>
      </html>
      `;

      try {
        const { error } = await resend.emails.send({
          from: "Cena de Gala <onboarding@resend.dev>",
          to: comensal.email,
          subject: `🎉 Esta noche: Mesa ${mesa.numero} - Asiento ${comensal.asiento}`,
          html: htmlContent,
        });

        if (error) {
          console.error(`Error enviando a ${comensal.email}:`, error);
          errores.push(`${comensal.email}: ${error.message || "Error desconocido"}`);
          fallidos++;
        } else {
          exitosos++;
        }
      } catch (error: any) {
        console.error(`Excepción enviando a ${comensal.email}:`, error);
        errores.push(`${comensal.email}: ${error.message || "Excepción"}`);
        fallidos++;
      }

      // Pequeña pausa entre emails para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      emails_enviados: exitosos,
      emails_fallidos: fallidos,
      total_comensales: comensales.length,
      errores: errores.slice(0, 10), // Solo primeros 10 errores
      fecha_envio: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error en envío masivo:", error);
    return NextResponse.json(
      {
        error: "Error en el envío masivo",
        detalle: error.message
      },
      { status: 500 }
    );
  }
}

// GET para testing (solo en desarrollo)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint solo disponible en desarrollo" },
      { status: 403 }
    );
  }

  const comensales = getComensales();
  const conMesa = comensales.filter(c => c.mesa_id !== null);

  return NextResponse.json({
    total_comensales: comensales.length,
    comensales_asignados: conMesa.length,
    fecha_cena_configurada: CONFIG_CENA.FECHA_CENA,
    hora_envio_configurada: CONFIG_CENA.HORA_ENVIO,
    nota: "Usa POST con Authorization header para ejecutar el envío"
  });
}
