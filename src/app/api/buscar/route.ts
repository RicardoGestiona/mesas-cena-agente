import { NextRequest, NextResponse } from "next/server";
import { buscarComensal, getCompanerosMesa, getMesas, getComensales, ejecutarSorteo, yaSeEnvioEmail, marcarEmailEnviado } from "@/lib/data";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { nombre, email } = await request.json();

    if (!nombre || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya se hizo el sorteo (los comensales tienen mesa asignada)
    const comensales = getComensales();
    const yaSorteado = comensales.some(c => c.mesa_id !== null);

    if (!yaSorteado) {
      // Ejecutar sorteo automáticamente la primera vez
      ejecutarSorteo();
    }

    // Buscar comensal
    const comensal = buscarComensal(nombre, email);

    if (!comensal) {
      return NextResponse.json(
        { error: "No se encontró ningún registro con ese nombre y email" },
        { status: 404 }
      );
    }

    if (!comensal.mesa_id) {
      return NextResponse.json(
        { error: "Aún no se ha realizado el sorteo de mesas" },
        { status: 400 }
      );
    }

    // Obtener mesa y compañeros
    const mesas = getMesas();
    const mesa = mesas.find(m => m.id === comensal.mesa_id);

    if (!mesa) {
      return NextResponse.json(
        { error: "Error al obtener información de la mesa" },
        { status: 500 }
      );
    }

    const companeros = getCompanerosMesa(comensal.mesa_id, comensal.id);

    // Enviar email automáticamente si no se ha enviado antes
    let emailEnviado = false;
    if (!yaSeEnvioEmail(comensal.email)) {
      emailEnviado = await enviarEmailComensal(comensal, mesa, companeros);
      if (emailEnviado) {
        marcarEmailEnviado(comensal.email);
      }
    } else {
      emailEnviado = true; // Ya se envió anteriormente
    }

    return NextResponse.json({
      comensal,
      mesa,
      companeros,
      todasLasMesas: mesas,
      emailEnviado
    });

  } catch (error) {
    console.error("Error en búsqueda:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función auxiliar para enviar email
async function enviarEmailComensal(comensal: any, mesa: any, companeros: any[]): Promise<boolean> {
  try {
    // Si no hay API key, simular envío
    if (!process.env.RESEND_API_KEY) {
      console.log(`✉️  Email simulado enviado a: ${comensal.email}`);
      return true;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

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
          <p>Tu ubicación ha sido asignada</p>
        </div>

        <div class="info-box" style="text-align: center;">
          <p>Hola <strong>${comensal.nombre} ${comensal.apellido}</strong>,</p>
          <p>Gracias por consultar tu ubicación. Tu mesa es:</p>
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
              .sort((a: any, b: any) => (a.asiento || 0) - (b.asiento || 0))
              .map((c: any) => `<li><strong>${c.nombre} ${c.apellido}</strong> - Asiento ${c.asiento}</li>`)
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

    const { error } = await resend.emails.send({
      from: "Cena de Gala <onboarding@resend.dev>",
      to: comensal.email,
      subject: `Tu ubicación: Mesa ${mesa.numero} - Asiento ${comensal.asiento}`,
      html: htmlContent,
    });

    if (error) {
      console.error(`❌ Error enviando email a ${comensal.email}:`, error);
      return false;
    }

    console.log(`✅ Email enviado exitosamente a: ${comensal.email}`);
    return true;

  } catch (error) {
    console.error("Error en envío de email:", error);
    return false;
  }
}
