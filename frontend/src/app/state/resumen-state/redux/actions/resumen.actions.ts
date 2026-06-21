import { createAction, props } from '@ngrx/store';
import { Resumen } from '../../../../core/models/api.models';

export const loadResumen = createAction('[Resumen] Load');

export const loadResumenSuccess = createAction(
  '[Resumen] Load Success',
  props<{ resumen: Resumen }>()
);

export const loadResumenFailure = createAction(
  '[Resumen] Load Failure',
  props<{ error: string }>()
);
