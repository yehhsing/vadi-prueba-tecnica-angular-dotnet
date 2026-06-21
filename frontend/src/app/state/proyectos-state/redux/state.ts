import { Proyecto } from '../../../core/models/api.models';

export interface ProyectosState {
  items: Proyecto[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
  selected: Proyecto | null;
  loading: boolean;
  loadingDetalle: boolean;
  saving: boolean;
  deletingId: number | null;
  error: string | null;
  operationError: string | null;
  lastOperationMessage: string | null;
}

export const initialProyectosState: ProyectosState = {
  items: [],
  total: 0,
  pagina: 1,
  tamanoPagina: 10,
  totalPaginas: 0,
  selected: null,
  loading: false,
  loadingDetalle: false,
  saving: false,
  deletingId: null,
  error: null,
  operationError: null,
  lastOperationMessage: null
};
