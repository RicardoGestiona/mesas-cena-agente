import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Comensal, Mesa } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { comensal, mesa, companeros } = await request.json() as {
      comensal: Comensal;
      mesa: Mesa;
      companeros: Comensal[];
    };

    if (!comensal || !mesa) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Verificar API key
    if (!process.env.RESEND_API_KEY) {
      // En desarrollo sin API key, simular envío exitoso
      console.log("Email simulado para:", comensal.email);
      return NextResponse.json({ success: true, simulated: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generar lista de compañeros ordenada
    const listaCompaneros = companeros
      .sort((a, b) => (a.asiento || 0) - (b.asiento || 0))
      .map(c => `• ${c.nombre} ${c.apellido} (Asiento ${c.asiento})`)
      .join("\n");

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
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #fbbf24; margin: 0; }
        .info-box { background: #0f3460; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .highlight { color: #fbbf24; font-weight: bold; font-size: 24px; }
        .croquis { background: #000; color: #10b981; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre; overflow-x: auto; }
        .companeros { list-style: none; padding: 0; }
        .companeros li { padding: 8px 0; border-bottom: 1px solid #0f3460; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Cena de Gala ✨</h1>
          <p>Tu ubicación ha sido asignada</p>
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
          <p>¡Te esperamos para una noche inolvidable!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Enviar email
    const { error } = await resend.emails.send({
      from: "Cena de Gala <onboarding@resend.dev>",
      to: comensal.email,
      subject: `Tu ubicación: Mesa ${mesa.numero} - Asiento ${comensal.asiento}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Error enviando email:", error);
      return NextResponse.json(
        { error: "Error al enviar el email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
