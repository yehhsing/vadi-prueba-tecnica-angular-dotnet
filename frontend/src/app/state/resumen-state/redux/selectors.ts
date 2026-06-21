import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ResumenState } from './state';

export const selectResumenState = createFeatureSelector<ResumenState>('resumen');

export const selectResumen = createSelector(selectResumenState, state => state.data);
export const selectResumenLoading = createSelector(selectResumenState, state => state.loading);
export const selectResumenError = createSelector(selectResumenState, state => state.error);

export const selectProyectosActivos = createSelector(
  selectResumen,
  resumen => resumen?.proyectosActivos ?? 0
);

export const selectTareasVencidas = createSelector(
  selectResumen,
  resumen => resumen?.tareasVencidas ?? 0
);

export const selectTareasPendientes = createSelector(
  selectResumen,
  resumen => resumen?.tareasPendientes ?? 0
);
