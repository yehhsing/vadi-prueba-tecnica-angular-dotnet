import { createAction, props } from '@ngrx/store';
import {
  ChangeEstadoTareaRequest,
  CreateTareaRequest,
  PagedResult,
  Tarea,
  UpdateTareaRequest
} from '../../../../core/models/api.models';

export const loadTareas = createAction(
  '[Tareas] Load',
  props<{ proyectoId: number; pagina: number; tamanoPagina: number }>()
);

export const loadTareasSuccess = createAction(
  '[Tareas] Load Success',
  props<{ result: PagedResult<Tarea> }>()
);

export const loadTareasFailure = createAction(
  '[Tareas] Load Failure',
  props<{ error: string }>()
);

export const loadTarea = createAction(
  '[Tareas] Load Detail',
  props<{ id: number }>()
);

export const loadTareaSuccess = createAction(
  '[Tareas] Load Detail Success',
  props<{ tarea: Tarea }>()
);

export const loadTareaFailure = createAction(
  '[Tareas] Load Detail Failure',
  props<{ error: string }>()
);

export const createTarea = createAction(
  '[Tareas] Create',
  props<{ payload: CreateTareaRequest }>()
);

export const createTareaSuccess = createAction(
  '[Tareas] Create Success',
  props<{ id: number }>()
);

export const createTareaFailure = createAction(
  '[Tareas] Create Failure',
  props<{ error: string }>()
);

export const updateTarea = createAction(
  '[Tareas] Update',
  props<{ id: number; payload: UpdateTareaRequest }>()
);

export const updateTareaSuccess = createAction(
  '[Tareas] Update Success',
  props<{ id: number }>()
);

export const updateTareaFailure = createAction(
  '[Tareas] Update Failure',
  props<{ error: string }>()
);

export const deleteTarea = createAction(
  '[Tareas] Delete',
  props<{ id: number }>()
);

export const deleteTareaSuccess = createAction(
  '[Tareas] Delete Success',
  props<{ id: number }>()
);

export const deleteTareaFailure = createAction(
  '[Tareas] Delete Failure',
  props<{ error: string }>()
);

export const changeEstadoTarea = createAction(
  '[Tareas] Change Estado',
  props<{ id: number; payload: ChangeEstadoTareaRequest }>()
);

export const changeEstadoTareaSuccess = createAction(
  '[Tareas] Change Estado Success',
  props<{ id: number; estadoId: number }>()
);

export const changeEstadoTareaFailure = createAction(
  '[Tareas] Change Estado Failure',
  props<{ error: string }>()
);

export const clearSelectedTarea = createAction('[Tareas] Clear Selected');
export const clearTareaOperationMessages = createAction('[Tareas] Clear Operation Messages');
