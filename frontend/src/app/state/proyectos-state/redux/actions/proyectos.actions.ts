import { createAction, props } from '@ngrx/store';
import {
  CreateProyectoRequest,
  PagedResult,
  Proyecto,
  UpdateProyectoRequest
} from '../../../../core/models/api.models';

export const loadProyectos = createAction(
  '[Proyectos] Load',
  props<{ pagina: number; tamanoPagina: number }>()
);

export const loadProyectosSuccess = createAction(
  '[Proyectos] Load Success',
  props<{ result: PagedResult<Proyecto> }>()
);

export const loadProyectosFailure = createAction(
  '[Proyectos] Load Failure',
  props<{ error: string }>()
);

export const loadProyecto = createAction(
  '[Proyectos] Load Detail',
  props<{ id: number }>()
);

export const loadProyectoSuccess = createAction(
  '[Proyectos] Load Detail Success',
  props<{ proyecto: Proyecto }>()
);

export const loadProyectoFailure = createAction(
  '[Proyectos] Load Detail Failure',
  props<{ error: string }>()
);

export const createProyecto = createAction(
  '[Proyectos] Create',
  props<{ payload: CreateProyectoRequest }>()
);

export const createProyectoSuccess = createAction(
  '[Proyectos] Create Success',
  props<{ id: number }>()
);

export const createProyectoFailure = createAction(
  '[Proyectos] Create Failure',
  props<{ error: string }>()
);

export const updateProyecto = createAction(
  '[Proyectos] Update',
  props<{ id: number; payload: UpdateProyectoRequest }>()
);

export const updateProyectoSuccess = createAction(
  '[Proyectos] Update Success',
  props<{ id: number }>()
);

export const updateProyectoFailure = createAction(
  '[Proyectos] Update Failure',
  props<{ error: string }>()
);

export const deleteProyecto = createAction(
  '[Proyectos] Delete',
  props<{ id: number }>()
);

export const deleteProyectoSuccess = createAction(
  '[Proyectos] Delete Success',
  props<{ id: number }>()
);

export const deleteProyectoFailure = createAction(
  '[Proyectos] Delete Failure',
  props<{ error: string }>()
);

export const clearSelectedProyecto = createAction('[Proyectos] Clear Selected');
export const clearProyectoOperationMessages = createAction('[Proyectos] Clear Operation Messages');
