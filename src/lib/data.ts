import { Comensal, Mesa } from "@/types";

// Generar 400 comensales ficticios MECE
const nombres = [
  "María", "José", "Antonio", "Ana", "Juan", "Carmen", "Francisco", "Isabel",
  "Manuel", "Dolores", "Pedro", "Rosa", "Miguel", "Pilar", "Carlos", "Teresa",
  "Luis", "Josefa", "Javier", "Lucia", "Rafael", "Elena", "Fernando", "Paula",
  "Daniel", "Laura", "Alejandro", "Cristina", "Pablo", "Marta", "David", "Sara",
  "Jorge", "Patricia", "Alberto", "Raquel", "Sergio", "Beatriz", "Andrés", "Silvia",
  "Diego", "Andrea", "Adrián", "Mónica", "Rubén", "Sandra", "Álvaro", "Natalia",
  "Víctor", "Irene", "Óscar", "Eva", "Roberto", "Alicia", "Enrique", "Clara",
  "Marcos", "Rocío", "Iván", "Marina", "Guillermo", "Diana", "Hugo", "Nuria"
];

const apellidos = [
  "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez", "Sánchez",
  "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales",
  "Jiménez", "Ruiz", "Álvarez", "Romero", "Serrano", "Blanco", "Suárez", "Iglesias",
  "Medina", "Garrido", "Cortés", "Castillo", "Santos", "Guerrero", "Ortega", "Rubio",
  "Marín", "Sanz", "Núñez", "Castro", "Ibáñez", "Crespo", "Ortiz", "Muñoz",
  "Domínguez", "Vázquez", "Ramos", "Gil", "Molina", "Delgado", "Cabrera", "Moreno",
  "Pascual", "Herrero", "Aguilar", "Nieto", "Gallego", "León", "Prieto", "Méndez"
];

// Generar 400 comensales únicos de forma determinista
export function generarComensales(): Comensal[] {
  const comensales: Comensal[] = [];
  let contador = 1;

  // Generar combinaciones deterministas
  for (let n = 0; n < nombres.length && contador <= 400; n++) {
    for (let a = 0; a < apellidos.length && contador <= 400; a++) {
      const nombre = nombres[n];
      const apellido = apellidos[a];

      // Generar email único sin acentos
      const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${contador}@email.com`
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      comensales.push({
        id: contador,
        nombre,
        apellido,
        email,
        mesa_id: null,
        asiento: null,
        created_at: new Date().toISOString()
      });

      contador++;
    }
  }

  return comensales;
}

// Generar 40 mesas (400 comensales / 10 por mesa)
export function generarMesas(): Mesa[] {
  const mesas: Mesa[] = [];
  const filas = 5;
  const columnas = 8;

  for (let i = 1; i <= 40; i++) {
    mesas.push({
      id: i,
      numero: i,
      capacidad: 10,
      posicion_x: ((i - 1) % columnas) + 1,
      posicion_y: Math.floor((i - 1) / columnas) + 1
    });
  }

  return mesas;
}

// Realizar sorteo aleatorio
export function realizarSorteo(comensales: Comensal[], mesas: Mesa[]): Comensal[] {
  // Mezclar comensales aleatoriamente (Fisher-Yates shuffle)
  const mezclados = [...comensales];
  for (let i = mezclados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezclados[i], mezclados[j]] = [mezclados[j], mezclados[i]];
  }

  // Asignar a mesas
  let mesaActual = 0;
  let asientoActual = 1;

  return mezclados.map(comensal => {
    if (asientoActual > mesas[mesaActual].capacidad) {
      mesaActual++;
      asientoActual = 1;
    }

    const asignado = {
      ...comensal,
      mesa_id: mesas[mesaActual].id,
      asiento: asientoActual
    };

    asientoActual++;
    return asignado;
  });
}

// Datos iniciales (se generan una vez y se mantienen en memoria para demo)
let _comensales: Comensal[] | null = null;
let _mesas: Mesa[] | null = null;

// Trackear emails enviados (en memoria - para producción usar DB)
const _emailsEnviados = new Set<string>();

export function getComensales(): Comensal[] {
  if (!_comensales) {
    _comensales = generarComensales();
  }
  return _comensales;
}

export function getMesas(): Mesa[] {
  if (!_mesas) {
    _mesas = generarMesas();
  }
  return _mesas;
}

export function ejecutarSorteo(): Comensal[] {
  const comensales = getComensales();
  const mesas = getMesas();
  _comensales = realizarSorteo(comensales, mesas);
  return _comensales;
}

function normalizarTexto(texto: string): string {
  return texto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function buscarComensal(nombre: string, email: string): Comensal | null {
  const comensales = getComensales();
  const nombreNormalizado = normalizarTexto(nombre);
  const emailNormalizado = normalizarTexto(email);

  console.log("Buscando comensal:", { nombre, email, nombreNormalizado, emailNormalizado });
  console.log("Total comensales:", comensales.length);

  const resultado = comensales.find(c => {
    const emailMatch = normalizarTexto(c.email) === emailNormalizado;
    const nombreCompleto = normalizarTexto(`${c.nombre} ${c.apellido}`);
    const nombreMatch = nombreCompleto.includes(nombreNormalizado) ||
                       normalizarTexto(c.nombre).includes(nombreNormalizado) ||
                       normalizarTexto(c.apellido).includes(nombreNormalizado);

    return emailMatch && nombreMatch;
  });

  console.log("Resultado búsqueda:", resultado ? `${resultado.nombre} ${resultado.apellido}` : "No encontrado");

  return resultado || null;
}

export function getCompanerosMesa(mesaId: number, comensalId: number): Comensal[] {
  const comensales = getComensales();
  return comensales.filter(c => c.mesa_id === mesaId && c.id !== comensalId);
}

export function marcarEmailEnviado(email: string): void {
  _emailsEnviados.add(email.toLowerCase());
}

export function yaSeEnvioEmail(email: string): boolean {
  return _emailsEnviados.has(email.toLowerCase());
}
