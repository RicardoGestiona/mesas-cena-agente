"use client";

import { Mesa } from "@/types";
import { cn } from "@/lib/utils";

interface SalaCroquisProps {
  mesas: Mesa[];
  mesaResaltada: number;
}

export default function SalaCroquis({ mesas, mesaResaltada }: SalaCroquisProps) {
  // Organizar mesas en grid 8x5
  const filas = 5;
  const columnas = 8;

  return (
    <div className="relative">
      {/* Escenario */}
      <div className="bg-amber-500/30 border-2 border-amber-500 rounded-lg p-3 mb-6 text-center">
        <span className="text-amber-200 font-semibold text-sm">ESCENARIO</span>
      </div>

      {/* Grid de mesas */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {Array.from({ length: filas * columnas }, (_, i) => {
          const mesaNum = i + 1;
          const mesa = mesas.find(m => m.numero === mesaNum);
          const esResaltada = mesaNum === mesaResaltada;

          return (
            <div
              key={mesaNum}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300",
                esResaltada
                  ? "bg-amber-500 text-black ring-4 ring-amber-300 scale-110 z-10"
                  : "bg-white/20 text-white/70 hover:bg-white/30"
              )}
            >
              {mesa ? mesaNum : "-"}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-gray-300">Tu mesa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/20"></div>
          <span className="text-gray-300">Otras mesas</span>
        </div>
      </div>

      {/* Entrada */}
      <div className="mt-6 text-center">
        <span className="text-gray-400 text-xs">↑ ENTRADA</span>
      </div>
    </div>
  );
}
