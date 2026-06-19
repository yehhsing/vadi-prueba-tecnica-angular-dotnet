import { inject, Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { ProyectosService } from '../../../../core/services/proyectos.service';
import * as ProyectosActions from '../actions/proyectos.actions';

@Injectable()
export class ProyectosEffects {
  private actions$ = inject(Actions);
  private proyectosService = inject(ProyectosService);

  // TODO: Implement NgRx effects for Proyectos.
  //
  // Required effects:
  //   loadProyectos$   — listens for loadProyectos, calls proyectosService.getAll(pagina, tamanoPagina)
  //                      dispatches loadProyectosSuccess or loadProyectosFailure
  //   createProyecto$  — listens for createProyecto, calls proyectosService.create(payload)
  //                      on success re-dispatch loadProyectos to refresh the list
  //   updateProyecto$  — listens for updateProyecto, calls proyectosService.update(id, payload)
  //                      on success re-dispatch loadProyectos to refresh the list
  //   deleteProyecto$  — listens for deleteProyecto, calls proyectosService.delete(id)
  //                      on success re-dispatch loadProyectos to refresh the list
  //
  // Use the same pattern as SessionEffects (see session-state/redux/effects/session.effects.ts).
}
