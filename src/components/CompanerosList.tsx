"use client";

import { Comensal } from "@/types";
import { User } from "lucide-react";

interface CompanerosListProps {
  companeros: Comensal[];
}

export default function CompanerosList({ companeros }: CompanerosListProps) {
  // Ordenar por asiento
  const ordenados = [...companeros].sort((a, b) => (a.asiento || 0) - (b.asiento || 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ordenados.map((companero) => (
        <div
          key={companero.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {companero.nombre} {companero.apellido}
            </p>
            <p className="text-gray-400 text-sm">
              Asiento {companero.asiento}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
