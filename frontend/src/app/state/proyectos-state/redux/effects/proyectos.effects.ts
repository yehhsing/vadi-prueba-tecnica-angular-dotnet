import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { ProyectosService } from '../../../../core/services/proyectos.service';
import * as ProyectosActions from '../actions/proyectos.actions';
import { selectProyectosQuery } from '../selectors';

@Injectable()
export class ProyectosEffects {
  private actions$ = inject(Actions);
  private proyectosService = inject(ProyectosService);
  private store = inject(Store);

  loadProyectos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.loadProyectos),
      switchMap(({ pagina, tamanoPagina }) =>
        this.proyectosService.getAll(pagina, tamanoPagina).pipe(
          map(response => ProyectosActions.loadProyectosSuccess({ result: response.data })),
          catchError(error =>
            of(ProyectosActions.loadProyectosFailure({
              error: this.getErrorMessage(error, 'Error al cargar proyectos')
            }))
          )
        )
      )
    )
  );

  loadProyecto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.loadProyecto),
      switchMap(({ id }) =>
        this.proyectosService.getById(id).pipe(
          map(response => ProyectosActions.loadProyectoSuccess({ proyecto: response.data })),
          catchError(error =>
            of(ProyectosActions.loadProyectoFailure({
              error: this.getErrorMessage(error, 'Error al cargar el proyecto')
            }))
          )
        )
      )
    )
  );

  createProyecto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.createProyecto),
      withLatestFrom(this.store.select(selectProyectosQuery)),
      concatMap(([{ payload }, query]) =>
        this.proyectosService.create(payload).pipe(
          mergeMap(response => [
            ProyectosActions.createProyectoSuccess({ id: response.data }),
            ProyectosActions.loadProyectos(query)
          ]),
          catchError(error =>
            of(ProyectosActions.createProyectoFailure({
              error: this.getErrorMessage(error, 'Error al crear el proyecto')
            }))
          )
        )
      )
    )
  );

  updateProyecto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.updateProyecto),
      withLatestFrom(this.store.select(selectProyectosQuery)),
      concatMap(([{ id, payload }, query]) =>
        this.proyectosService.update(id, payload).pipe(
          mergeMap(() => [
            ProyectosActions.updateProyectoSuccess({ id }),
            ProyectosActions.loadProyectos(query)
          ]),
          catchError(error =>
            of(ProyectosActions.updateProyectoFailure({
              error: this.getErrorMessage(error, 'Error al actualizar el proyecto')
            }))
          )
        )
      )
    )
  );

  deleteProyecto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.deleteProyecto),
      withLatestFrom(this.store.select(selectProyectosQuery)),
      concatMap(([{ id }, query]) =>
        this.proyectosService.delete(id).pipe(
          mergeMap(() => [
            ProyectosActions.deleteProyectoSuccess({ id }),
            ProyectosActions.loadProyectos(query)
          ]),
          catchError(error =>
            of(ProyectosActions.deleteProyectoFailure({
              error: this.getErrorMessage(error, 'Error al eliminar el proyecto')
            }))
          )
        )
      )
    )
  );

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const responseError = (error as { error?: { message?: string } }).error;
      return responseError?.message ?? fallback;
    }

    return fallback;
  }
}
