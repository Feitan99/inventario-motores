export const WA_NUMBER = "56978740432";

export type Motor = {
  id: string;
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
  numero_cilindros: number | null;
  numero_valvulas: number | null;
  rectificada: boolean | null;
};

