import { createReducer, on } from '@ngrx/store';
import { initialProyectosState } from './state';
import * as ProyectosActions from './actions/proyectos.actions';

export const proyectosReducer = createReducer(
  initialProyectosState,
  on(ProyectosActions.loadProyectos, (state, { pagina, tamanoPagina }) => ({
    ...state,
    pagina,
    tamanoPagina,
    loading: true,
    error: null
  })),
  on(ProyectosActions.loadProyectosSuccess, (state, { result }) => ({
    ...state,
    items: result.items,
    total: result.total,
    pagina: result.pagina,
    tamanoPagina: result.tamanoPagina,
    totalPaginas: result.totalPaginas,
    loading: false
  })),
  on(ProyectosActions.loadProyectosFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),
  on(ProyectosActions.loadProyecto, state => ({
    ...state,
    selected: null,
    loadingDetalle: true,
    error: null
  })),
  on(ProyectosActions.loadProyectoSuccess, (state, { proyecto }) => ({
    ...state,
    selected: proyecto,
    loadingDetalle: false
  })),
  on(ProyectosActions.loadProyectoFailure, (state, { error }) => ({
    ...state,
    loadingDetalle: false,
    error
  })),
  on(ProyectosActions.createProyecto, ProyectosActions.updateProyecto, state => ({
    ...state,
    saving: true,
    operationError: null,
    lastOperationMessage: null
  })),
  on(ProyectosActions.createProyectoSuccess, state => ({
    ...state,
    saving: false,
    lastOperationMessage: 'Proyecto creado correctamente'
  })),
  on(ProyectosActions.updateProyectoSuccess, state => ({
    ...state,
    saving: false,
    lastOperationMessage: 'Proyecto actualizado correctamente'
  })),
  on(ProyectosActions.createProyectoFailure, ProyectosActions.updateProyectoFailure, (state, { error }) => ({
    ...state,
    saving: false,
    operationError: error
  })),
  on(ProyectosActions.deleteProyecto, (state, { id }) => ({
    ...state,
    deletingId: id,
    operationError: null,
    lastOperationMessage: null
  })),
  on(ProyectosActions.deleteProyectoSuccess, (state, { id }) => ({
    ...state,
    deletingId: null,
    items: state.items.filter(proyecto => proyecto.id !== id),
    lastOperationMessage: 'Proyecto eliminado correctamente'
  })),
  on(ProyectosActions.deleteProyectoFailure, (state, { error }) => ({
    ...state,
    deletingId: null,
    operationError: error
  })),
  on(ProyectosActions.clearSelectedProyecto, state => ({
    ...state,
    selected: null
  })),
  on(ProyectosActions.clearProyectoOperationMessages, state => ({
    ...state,
    operationError: null,
    lastOperationMessage: null
  }))
);
