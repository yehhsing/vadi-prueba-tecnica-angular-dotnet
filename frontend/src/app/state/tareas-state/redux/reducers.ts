import { createReducer, on } from '@ngrx/store';
import { initialTareasState } from './state';
import * as TareasActions from './actions/tareas.actions';

export const tareasReducer = createReducer(
  initialTareasState,
  on(TareasActions.loadTareas, (state, { proyectoId, pagina, tamanoPagina }) => ({
    ...state,
    proyectoId,
    pagina,
    tamanoPagina,
    loading: true,
    error: null
  })),
  on(TareasActions.loadTareasSuccess, (state, { result }) => ({
    ...state,
    items: result.items,
    total: result.total,
    pagina: result.pagina,
    tamanoPagina: result.tamanoPagina,
    totalPaginas: result.totalPaginas,
    loading: false
  })),
  on(TareasActions.loadTareasFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(TareasActions.loadTarea, state => ({
    ...state,
    selected: null,
    loadingDetalle: true,
    error: null
  })),
  on(TareasActions.loadTareaSuccess, (state, { tarea }) => ({
    ...state,
    selected: tarea,
    loadingDetalle: false
  })),
  on(TareasActions.loadTareaFailure, (state, { error }) => ({
    ...state,
    loadingDetalle: false,
    error
  })),
  on(TareasActions.createTarea, TareasActions.updateTarea, state => ({
    ...state,
    saving: true,
    operationError: null,
    lastOperationMessage: null
  })),
  on(TareasActions.createTareaSuccess, state => ({
    ...state,
    saving: false,
    lastOperationMessage: 'Tarea creada correctamente'
  })),
  on(TareasActions.updateTareaSuccess, state => ({
    ...state,
    saving: false,
    lastOperationMessage: 'Tarea actualizada correctamente'
  })),
  on(TareasActions.createTareaFailure, TareasActions.updateTareaFailure, (state, { error }) => ({
    ...state,
    saving: false,
    operationError: error
  })),
  on(TareasActions.deleteTarea, (state, { id }) => ({
    ...state,
    deletingId: id,
    operationError: null,
    lastOperationMessage: null
  })),
  on(TareasActions.deleteTareaSuccess, (state, { id }) => ({
    ...state,
    deletingId: null,
    items: state.items.filter(tarea => tarea.id !== id),
    lastOperationMessage: 'Tarea eliminada correctamente'
  })),
  on(TareasActions.deleteTareaFailure, (state, { error }) => ({
    ...state,
    deletingId: null,
    operationError: error
  })),
  on(TareasActions.changeEstadoTarea, (state, { id }) => ({
    ...state,
    changingEstadoId: id,
    operationError: null,
    lastOperationMessage: null
  })),
  on(TareasActions.changeEstadoTareaSuccess, (state, { id, estadoId }) => ({
    ...state,
    changingEstadoId: null,
    items: state.items.map(tarea => tarea.id === id ? { ...tarea, estadoId } : tarea),
    selected: state.selected?.id === id ? { ...state.selected, estadoId } : state.selected,
    lastOperationMessage: 'Estado de tarea actualizado correctamente'
  })),
  on(TareasActions.changeEstadoTareaFailure, (state, { error }) => ({
    ...state,
    changingEstadoId: null,
    operationError: error
  })),
  on(TareasActions.clearSelectedTarea, state => ({
    ...state,
    selected: null
  })),
  on(TareasActions.clearTareaOperationMessages, state => ({
    ...state,
    operationError: null,
    lastOperationMessage: null
  }))
);
