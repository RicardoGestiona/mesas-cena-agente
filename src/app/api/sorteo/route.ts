import { NextResponse } from "next/server";
import { ejecutarSorteo } from "@/lib/data";

export async function POST() {
  try {
    const comensalesAsignados = ejecutarSorteo();

    return NextResponse.json({
      success: true,
      message: "Sorteo realizado exitosamente",
      asignaciones: comensalesAsignados.length
    });

  } catch (error) {
    console.error("Error en sorteo:", error);
    return NextResponse.json(
      { error: "Error al realizar el sorteo" },
      { status: 500 }
    );
  }
}
