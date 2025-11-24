"use client";

import { Comensal } from "@/types";
import { cn } from "@/lib/utils";

interface MesaCroquisProps {
  asientoUsuario: number;
  companeros: Comensal[];
}

export default function MesaCroquis({ asientoUsuario, companeros }: MesaCroquisProps) {
  // Mesa redonda con 10 asientos
  const asientos = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Mesa central */}
        <div className="absolute inset-12 rounded-full bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-700 shadow-xl">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center">
            <span className="text-amber-200 font-semibold text-sm">MESA</span>
          </div>
        </div>

        {/* Asientos alrededor */}
        {asientos.map((num) => {
          const angle = ((num - 1) * 36 - 90) * (Math.PI / 180); // 36° entre asientos
          const radius = 45; // % desde el centro
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          const esUsuario = num === asientoUsuario;
          const companero = companeros.find(c => c.asiento === num);

          return (
            <div
              key={num}
              className={cn(
                "absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all",
                esUsuario
                  ? "bg-amber-500 text-black ring-4 ring-amber-300 scale-110 z-10"
                  : "bg-white/30 text-white"
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              title={esUsuario ? "Tú" : companero ? `${companero.nombre} ${companero.apellido}` : ""}
            >
              {num}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span className="text-gray-300">Tu asiento</span>
        </div>
      </div>
    </div>
  );
}
