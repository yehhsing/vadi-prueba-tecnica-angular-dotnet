import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, map, of, switchMap } from 'rxjs';
import { ResumenService } from '../../../../core/services/resumen.service';
import * as ResumenActions from '../actions/resumen.actions';

@Injectable()
export class ResumenEffects {
  private actions$ = inject(Actions);
  private resumenService = inject(ResumenService);

  loadResumen$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResumenActions.loadResumen),
      switchMap(() =>
        this.resumenService.getResumen().pipe(
          delay(1000),
          map(response => ResumenActions.loadResumenSuccess({ resumen: response.data })),
          catchError(error =>
            of(ResumenActions.loadResumenFailure({
              error: error.error?.message ?? 'Error al cargar el resumen'
            }))
          )
        )
      )
    )
  );
}
