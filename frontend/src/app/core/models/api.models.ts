export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export type UserRole = 'Administrador' | 'Colaborador' | 'Visualizador';

export type EstadoNombre = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';

export type PrioridadNombre = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSession {
  token: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export type LoginResponse = ApiResponse<LoginSession>;

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  estadoId: number;
  estadoNombre: EstadoNombre;
  creadoPorId: number;
  creadoPorNombre: string;
  fechaCreacion: string;
}

export interface CreateProyectoRequest {
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  estadoId: number;
}

export interface UpdateProyectoRequest {
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  estadoId: number;
}

export interface Tarea {
  id: number;
  proyectoId: number;
  proyectoNombre: string;
  titulo: string;
  descripcion: string | null;
  prioridadId: number;
  prioridadNombre: PrioridadNombre;
  estadoId: number;
  estadoNombre: EstadoNombre;
  usuarioAsignadoId: number | null;
  usuarioAsignadoNombre: string | null;
  fechaLimite: string;
  fechaCreacion: string;
}

export interface CreateTareaRequest {
  proyectoId: number;
  titulo: string;
  descripcion: string | null;
  prioridadId: number;
  estadoId: number | null;
  usuarioAsignadoId: number | null;
  fechaLimite: string;
}

export interface UpdateTareaRequest {
  proyectoId: number;
  titulo: string;
  descripcion: string | null;
  prioridadId: number;
  estadoId: number | null;
  usuarioAsignadoId: number | null;
  fechaLimite: string;
}

export interface ChangeEstadoTareaRequest {
  estadoId: number;
}

export interface Resumen {
  proyectosActivos: number;
  tareasVencidas: number;
  tareasPendientes: number;
}
