"use client";

import { useState } from "react";
import { Search, MapPin, Users, Sparkles } from "lucide-react";
import { Comensal, Mesa } from "@/types";
import SalaCroquis from "@/components/SalaCroquis";
import MesaCroquis from "@/components/MesaCroquis";
import CompanerosList from "@/components/CompanerosList";

export default function Home() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<{
    comensal: Comensal;
    mesa: Mesa;
    companeros: Comensal[];
    emailEnviado?: boolean;
  } | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const response = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al buscar");
        return;
      }

      setResultado(data);
      setMesas(data.todasLasMesas || []);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Cena de Gala
            </h1>
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-lg text-gray-300">
            Descubre tu mesa y compañeros de cena
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre o apellido"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    📧 Email de registro
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Buscar mi mesa
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Resultados */}
        {resultado && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Info del comensal */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Hola, {resultado.comensal.nombre}!
              </h2>
              <div className="flex items-center justify-center gap-2 text-amber-300 mb-3">
                <MapPin className="w-5 h-5" />
                <span className="text-xl">
                  Mesa {resultado.mesa.numero} - Asiento {resultado.comensal.asiento}
                </span>
              </div>
              {resultado.emailEnviado && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm">
                  ✅ Email enviado a {resultado.comensal.email}
                </div>
              )}
            </div>

            {/* Croquis de la sala */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Ubicación en la Sala
              </h3>
              <SalaCroquis
                mesas={mesas}
                mesaResaltada={resultado.mesa.numero}
              />
            </div>

            {/* Croquis de la mesa */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Tu Asiento en la Mesa {resultado.mesa.numero}
              </h3>
              <MesaCroquis
                asientoUsuario={resultado.comensal.asiento || 1}
                companeros={resultado.companeros}
              />
            </div>

            {/* Lista de compañeros */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Tus Compañeros de Mesa
              </h3>
              <CompanerosList companeros={resultado.companeros} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
