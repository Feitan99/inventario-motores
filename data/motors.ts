export const WA_NUMBER = "56912345678";

export type Motor = {
  id: string; // Cambiado a string (UUID)
  marca: string;
  modelo: string;
  tipo: string;
  nro_serie: string;
  anio: number;
  estado: string;
  ubicacion: string;
  costo: number;
  precio: number;
  observaciones: string;
  fotos: string[];
};

