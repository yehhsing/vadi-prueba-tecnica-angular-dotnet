import { Tarea } from '../../../core/models/api.models';

export interface TareasState {
  items: Tarea[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
  proyectoId: number | null;
  selected: Tarea | null;
  loading: boolean;
  loadingDetalle: boolean;
  saving: boolean;
  deletingId: number | null;
  changingEstadoId: number | null;
  error: string | null;
  operationError: string | null;
  lastOperationMessage: string | null;
}

export const initialTareasState: TareasState = {
  items: [],
  total: 0,
  pagina: 1,
  tamanoPagina: 10,
  totalPaginas: 0,
  proyectoId: null,
  selected: null,
  loading: false,
  loadingDetalle: false,
  saving: false,
  deletingId: null,
  changingEstadoId: null,
  error: null,
  operationError: null,
  lastOperationMessage: null
};
