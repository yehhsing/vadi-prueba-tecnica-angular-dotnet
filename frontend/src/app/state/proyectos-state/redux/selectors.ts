import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProyectosState } from './state';

export const selectProyectosState = createFeatureSelector<ProyectosState>('proyectos');

export const selectProyectos = createSelector(selectProyectosState, state => state.items);
export const selectProyectosTotal = createSelector(selectProyectosState, state => state.total);
export const selectProyectosPagina = createSelector(selectProyectosState, state => state.pagina);
export const selectProyectosTamanoPagina = createSelector(selectProyectosState, state => state.tamanoPagina);
export const selectProyectosTotalPaginas = createSelector(selectProyectosState, state => state.totalPaginas);
export const selectProyectoSelected = createSelector(selectProyectosState, state => state.selected);
export const selectProyectosLoading = createSelector(selectProyectosState, state => state.loading);
export const selectProyectoDetalleLoading = createSelector(selectProyectosState, state => state.loadingDetalle);
export const selectProyectoSaving = createSelector(selectProyectosState, state => state.saving);
export const selectProyectoDeletingId = createSelector(selectProyectosState, state => state.deletingId);
export const selectProyectosError = createSelector(selectProyectosState, state => state.error);
export const selectProyectoOperationError = createSelector(selectProyectosState, state => state.operationError);
export const selectProyectoLastOperationMessage = createSelector(
  selectProyectosState,
  state => state.lastOperationMessage
);

export const selectProyectosQuery = createSelector(
  selectProyectosPagina,
  selectProyectosTamanoPagina,
  (pagina, tamanoPagina) => ({ pagina, tamanoPagina })
);
