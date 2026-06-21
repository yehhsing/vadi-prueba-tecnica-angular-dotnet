import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { TareasService } from '../../../../core/services/tareas.service';
import * as TareasActions from '../actions/tareas.actions';
import { selectTareasQuery } from '../selectors';

@Injectable()
export class TareasEffects {
  private actions$ = inject(Actions);
  private tareasService = inject(TareasService);
  private store = inject(Store);

  loadTareas$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.loadTareas),
      switchMap(({ proyectoId, pagina, tamanoPagina }) =>
        this.tareasService.getAll(proyectoId, pagina, tamanoPagina).pipe(
          map(response => TareasActions.loadTareasSuccess({ result: response.data })),
          catchError(error =>
            of(TareasActions.loadTareasFailure({
              error: this.getErrorMessage(error, 'Error al cargar tareas')
            }))
          )
        )
      )
    )
  );

  loadTarea$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.loadTarea),
      switchMap(({ id }) =>
        this.tareasService.getById(id).pipe(
          map(response => TareasActions.loadTareaSuccess({ tarea: response.data })),
          catchError(error =>
            of(TareasActions.loadTareaFailure({
              error: this.getErrorMessage(error, 'Error al cargar la tarea')
            }))
          )
        )
      )
    )
  );

  createTarea$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.createTarea),
      withLatestFrom(this.store.select(selectTareasQuery)),
      concatMap(([{ payload }, query]) =>
        this.tareasService.create(payload).pipe(
          mergeMap(response => [
            TareasActions.createTareaSuccess({ id: response.data }),
            TareasActions.loadTareas({
              proyectoId: query.proyectoId ?? payload.proyectoId,
              pagina: query.pagina,
              tamanoPagina: query.tamanoPagina
            })
          ]),
          catchError(error =>
            of(TareasActions.createTareaFailure({
              error: this.getErrorMessage(error, 'Error al crear la tarea')
            }))
          )
        )
      )
    )
  );

  updateTarea$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.updateTarea),
      withLatestFrom(this.store.select(selectTareasQuery)),
      concatMap(([{ id, payload }, query]) =>
        this.tareasService.update(id, payload).pipe(
          mergeMap(() => [
            TareasActions.updateTareaSuccess({ id }),
            TareasActions.loadTareas({
              proyectoId: query.proyectoId ?? payload.proyectoId,
              pagina: query.pagina,
              tamanoPagina: query.tamanoPagina
            })
          ]),
          catchError(error =>
            of(TareasActions.updateTareaFailure({
              error: this.getErrorMessage(error, 'Error al actualizar la tarea')
            }))
          )
        )
      )
    )
  );

  deleteTarea$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.deleteTarea),
      withLatestFrom(this.store.select(selectTareasQuery)),
      concatMap(([{ id }, query]) =>
        this.tareasService.delete(id).pipe(
          mergeMap(() => [
            TareasActions.deleteTareaSuccess({ id }),
            ...this.reloadCurrentQuery(query)
          ]),
          catchError(error =>
            of(TareasActions.deleteTareaFailure({
              error: this.getErrorMessage(error, 'Error al eliminar la tarea')
            }))
          )
        )
      )
    )
  );

  changeEstadoTarea$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TareasActions.changeEstadoTarea),
      withLatestFrom(this.store.select(selectTareasQuery)),
      concatMap(([{ id, payload }, query]) =>
        this.tareasService.changeEstado(id, payload).pipe(
          mergeMap(() => [
            TareasActions.changeEstadoTareaSuccess({ id, estadoId: payload.estadoId }),
            ...this.reloadCurrentQuery(query)
          ]),
          catchError(error =>
            of(TareasActions.changeEstadoTareaFailure({
              error: this.getErrorMessage(error, 'Error al cambiar el estado de la tarea')
            }))
          )
        )
      )
    )
  );

  private reloadCurrentQuery(query: {
    proyectoId: number | null;
    pagina: number;
    tamanoPagina: number;
  }): ReturnType<typeof TareasActions.loadTareas>[] {
    if (!query.proyectoId) {
      return [];
    }

    return [TareasActions.loadTareas({
      proyectoId: query.proyectoId,
      pagina: query.pagina,
      tamanoPagina: query.tamanoPagina
    })];
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = (error as { error?: { message?: string } }).error;
      return responseError?.message ?? fallback;
    }

    return fallback;
  }
}
