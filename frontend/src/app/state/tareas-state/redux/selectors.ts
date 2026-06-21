import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TareasState } from './state';

export const selectTareasState = createFeatureSelector<TareasState>('tareas');

export const selectTareas = createSelector(selectTareasState, state => state.items);
export const selectTareasTotal = createSelector(selectTareasState, state => state.total);
export const selectTareasPagina = createSelector(selectTareasState, state => state.pagina);
export const selectTareasTamanoPagina = createSelector(selectTareasState, state => state.tamanoPagina);
export const selectTareasTotalPaginas = createSelector(selectTareasState, state => state.totalPaginas);
export const selectTareasProyectoId = createSelector(selectTareasState, state => state.proyectoId);
export const selectTareaSelected = createSelector(selectTareasState, state => state.selected);
export const selectTareasLoading = createSelector(selectTareasState, state => state.loading);
export const selectTareaDetalleLoading = createSelector(selectTareasState, state => state.loadingDetalle);
export const selectTareaSaving = createSelector(selectTareasState, state => state.saving);
export const selectTareaDeletingId = createSelector(selectTareasState, state => state.deletingId);
export const selectTareaChangingEstadoId = createSelector(selectTareasState, state => state.changingEstadoId);
export const selectTareasError = createSelector(selectTareasState, state => state.error);
export const selectTareaOperationError = createSelector(selectTareasState, state => state.operationError);
export const selectTareaLastOperationMessage = createSelector(
  selectTareasState,
  state => state.lastOperationMessage
);

export const selectTareasQuery = createSelector(
  selectTareasProyectoId,
  selectTareasPagina,
  selectTareasTamanoPagina,
  (proyectoId, pagina, tamanoPagina) => ({ proyectoId, pagina, tamanoPagina })
);
