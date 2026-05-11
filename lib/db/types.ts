export type MotorRow = {
  id: string;
  numero_serie: string;
  tipo_combustible: string;
  anio: number;
  estado: string;
  ubicacion: string;
  costo_compra: number;
  precio_venta: number;
  observaciones: string;
  numero_cilindros: number | null;
  numero_valvulas: number | null;
  rectificada: boolean | null;
  marca_id: string;
  modelo_id: string;
};

export type MotorConRelaciones = MotorRow & {
  marca: string;
  modelo: string;
  fotos: string[];
};

export type MarcaRow = {
  id: string;
  nombre: string;
};

export type ModeloRow = {
  id: string;
  nombre: string;
  marca_id: string;
};

export type FotoRow = {
  id: string;
  motor_id: string;
  storage_path: string;
};

export type UsuarioRow = {
  id: string;
  email: string;
  password_hash: string;
};

export type CreateMotorInput = {
  numero_serie: string;
  tipo_combustible: string;
  anio: number;
  estado: string;
  ubicacion: string;
  costo_compra: number;
  precio_venta: number;
  observaciones: string;
  numero_cilindros: number | null;
  numero_valvulas: number | null;
  rectificada: boolean | null;
  marca_id: string;
  modelo_id: string;
};

export type UpdateMotorInput = Partial<CreateMotorInput>;
