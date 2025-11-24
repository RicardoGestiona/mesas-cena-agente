// Tipos MECE (Mutually Exclusive, Collectively Exhaustive) para el sistema de mesas

export interface Comensal {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  mesa_id: number | null;
  asiento: number | null;
  created_at: string;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  posicion_x: number; // Posición en el croquis (columna)
  posicion_y: number; // Posición en el croquis (fila)
}

export interface AsignacionMesa {
  comensal: Comensal;
  mesa: Mesa;
  companeros: Comensal[];
}

export interface BusquedaFormData {
  nombre: string;
  email: string;
}

export interface SorteoResult {
  success: boolean;
  message: string;
  asignaciones?: number;
}
