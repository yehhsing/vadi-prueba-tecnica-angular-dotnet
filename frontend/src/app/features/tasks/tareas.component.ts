import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, take } from 'rxjs';
import { Proyecto, Tarea } from '../../core/models/api.models';
import { selectRol } from '../../state/session-state/redux/selectors';
import * as ProyectosActions from '../../state/proyectos-state/redux/actions/proyectos.actions';
import { selectProyectoSelected } from '../../state/proyectos-state/redux/selectors';
import * as TareasActions from '../../state/tareas-state/redux/actions/tareas.actions';
import {
  selectTareaChangingEstadoId,
  selectTareaDeletingId,
  selectTareaLastOperationMessage,
  selectTareaOperationError,
  selectTareaSaving,
  selectTareas,
  selectTareasError,
  selectTareasLoading,
  selectTareasPagina,
  selectTareasTamanoPagina,
  selectTareasTotal
} from '../../state/tareas-state/redux/selectors';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="app-title">Gestion de Tareas</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/proyectos">
        <mat-icon>folder</mat-icon>
        Proyectos
      </a>
      <a mat-button routerLink="/home">
        <mat-icon>dashboard</mat-icon>
        Inicio
      </a>
    </mat-toolbar>

    <main class="tasks-page">
      <section class="page-header">
        <div>
          <h2>Tareas</h2>
          @if (proyecto$ | async; as proyecto) {
            <p>{{ proyecto.nombre }} · {{ proyecto.estadoNombre }}</p>
          } @else {
            <p>Listado paginado por proyecto.</p>
          }
        </div>

        @if (isEditor$ | async) {
          <button
            mat-flat-button
            color="primary"
            type="button"
            (click)="startCreate()"
          >
            <mat-icon>add_task</mat-icon>
            Nueva tarea
          </button>
        }
      </section>

      @if (showForm) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{
              editingTarea ? 'Editar tarea' : 'Crear tarea'
            }}</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form class="task-form" [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline">
                <mat-label>Titulo</mat-label>
                <input matInput formControlName="titulo" maxlength="140" />
                @if (form.controls.titulo.hasError('required')) {
                  <mat-error>El titulo es requerido.</mat-error>
                }
                @if (form.controls.titulo.hasError('minlength')) {
                  <mat-error>El titulo debe tener al menos 3 caracteres.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha limite</mat-label>
                <input matInput type="date" formControlName="fechaLimite" />
                @if (form.controls.fechaLimite.hasError('required')) {
                  <mat-error>La fecha limite es requerida.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prioridad</mat-label>
                <mat-select formControlName="prioridadId">
                  @for (prioridad of prioridades; track prioridad.id) {
                    <mat-option [value]="prioridad.id">{{
                      prioridad.nombre
                    }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Usuario asignado ID</mat-label>
                <input
                  matInput
                  type="number"
                  min="1"
                  max="3"
                  formControlName="usuarioAsignadoId"
                />
                @if (form.controls.usuarioAsignadoId.hasError('min')) {
                  <mat-error>El ID debe ser mayor a cero.</mat-error>
                }
                @if (form.controls.usuarioAsignadoId.hasError('max')) {
                  <mat-error>Solo se permiten usuarios del 1 al 3.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="wide">
                <mat-label>Descripcion</mat-label>
                <textarea
                  matInput
                  formControlName="descripcion"
                  rows="3"
                ></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="cancelForm()">
                  Cancelar
                </button>
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="form.invalid || (saving$ | async)"
                >
                  @if (saving$ | async) {
                    <mat-spinner diameter="18" />
                  } @else {
                    <mat-icon>save</mat-icon>
                  }
                  Guardar
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (operationError$ | async; as operationError) {
        <p class="message error-message">{{ operationError }}</p>
      }

      @if (lastOperationMessage$ | async; as lastOperationMessage) {
        <p class="message success-message">{{ lastOperationMessage }}</p>
      }

      <mat-card class="table-card">
        <mat-card-content>
          @if (error$ | async; as error) {
            <p class="message error-message">{{ error }}</p>
          }

          <div class="table-wrap">
            <table
              mat-table
              [dataSource]="(tareas$ | async) ?? []"
              class="tasks-table"
            >
              <ng-container matColumnDef="titulo">
                <th mat-header-cell *matHeaderCellDef>Titulo</th>
                <td mat-cell *matCellDef="let tarea">
                  <div class="task-title">
                    <span>{{ tarea.titulo }}</span>
                    @if (isOverdue(tarea)) {
                      <span class="overdue-pill">Vencida</span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let tarea">
                  <span class="status-pill" [class.done]="tarea.estadoId === 3" [class.cancelled]="tarea.estadoId === 4">
                    {{ tarea.estadoNombre }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="prioridad">
                <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                <td mat-cell *matCellDef="let tarea">
                  <span class="priority-pill" [class.high]="tarea.prioridadId >= 3">
                    {{ tarea.prioridadNombre }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="usuarioAsignado">
                <th mat-header-cell *matHeaderCellDef>Asignado</th>
                <td mat-cell *matCellDef="let tarea">
                  {{ tarea.usuarioAsignadoNombre ?? 'Sin asignar' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="fechaLimite">
                <th mat-header-cell *matHeaderCellDef>Fecha limite</th>
                <td mat-cell *matCellDef="let tarea">
                  {{ tarea.fechaLimite | date: 'yyyy-MM-dd' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let tarea">
                  <div class="row-actions">
                    @if (isEditor$ | async) {
                      <button
                        mat-icon-button
                        type="button"
                        [matMenuTriggerFor]="estadoMenu"
                        [disabled]="(changingEstadoId$ | async) === tarea.id"
                        title="Cambiar estado"
                      >
                        @if ((changingEstadoId$ | async) === tarea.id) {
                          <mat-spinner diameter="18" />
                        } @else {
                          <mat-icon>published_with_changes</mat-icon>
                        }
                      </button>
                      <mat-menu #estadoMenu="matMenu">
                        @for (estado of getEstadoOptionsForTarea(tarea); track estado.id) {
                          <button
                            mat-menu-item
                            type="button"
                            (click)="changeEstado(tarea, estado.id)"
                          >
                            <mat-icon>{{ estado.icon }}</mat-icon>
                            <span>{{ estado.nombre }}</span>
                          </button>
                        }
                      </mat-menu>

                      <button
                        mat-icon-button
                        type="button"
                        (click)="startEdit(tarea)"
                        title="Editar"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                    }

                    @if (isAdmin$ | async) {
                      <button
                        mat-icon-button
                        type="button"
                        color="warn"
                        (click)="deleteTarea(tarea)"
                        [disabled]="(deletingId$ | async) === tarea.id"
                        title="Eliminar"
                      >
                        @if ((deletingId$ | async) === tarea.id) {
                          <mat-spinner diameter="18" />
                        } @else {
                          <mat-icon>delete</mat-icon>
                        }
                      </button>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                [class.overdue-row]="isOverdue(row)"
              ></tr>
            </table>

            @if (loading$ | async) {
              <div class="table-loading">
                <mat-spinner diameter="32" />
                <span>Cargando tareas...</span>
              </div>
            }

            @if (empty$ | async) {
              <p class="empty-state">No hay tareas para mostrar.</p>
            }
          </div>

          <mat-paginator
            [length]="total$ | async"
            [pageIndex]="((pagina$ | async) ?? 1) - 1"
            [pageSize]="(tamanoPagina$ | async) ?? 10"
            [pageSizeOptions]="[5, 10, 20]"
            (page)="pageChanged($event)"
          />
        </mat-card-content>
      </mat-card>
    </main>
  `,
  styles: [
    `
      mat-toolbar {
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .app-title {
        font-weight: 600;
        font-size: 1.1rem;
      }
      .spacer {
        flex: 1;
      }
      .tasks-page {
        padding: 28px 24px;
        max-width: 1180px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      h2 {
        margin: 0 0 4px;
        font-size: 1.55rem;
      }
      p {
        margin: 0;
      }
      .page-header p {
        color: #666;
      }
      .form-card {
        margin-bottom: 18px;
        border-radius: 8px;
      }
      .task-form {
        display: grid;
        grid-template-columns: repeat(2, minmax(220px, 1fr));
        gap: 14px 16px;
        padding-top: 14px;
      }
      .wide {
        grid-column: 1 / -1;
      }
      .form-actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .form-actions mat-spinner,
      .row-actions mat-spinner {
        display: inline-block;
        margin-right: 8px;
        vertical-align: middle;
      }
      .table-card {
        border-radius: 8px;
      }
      .table-wrap {
        position: relative;
        overflow-x: auto;
        min-height: 180px;
      }
      .tasks-table {
        width: 100%;
        min-width: 860px;
      }
      .task-title {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 32px;
      }
      .status-pill,
      .priority-pill,
      .overdue-pill {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .status-pill {
        background: #e8f2ff;
        color: #145ea8;
      }
      .status-pill.done {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .status-pill.cancelled {
        background: #eceff1;
        color: #455a64;
      }
      .priority-pill {
        background: #fff3e0;
        color: #9a4f00;
      }
      .priority-pill.high,
      .overdue-pill {
        background: #ffebee;
        color: #b71c1c;
      }
      .overdue-row {
        background: #fff8f8;
      }
      .row-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .row-actions mat-spinner {
        margin: auto;
      }
      .table-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.72);
        color: #555;
      }
      .empty-state {
        padding: 28px 12px;
        text-align: center;
        color: #666;
      }
      .message {
        padding: 10px 12px;
        border-radius: 6px;
        margin-bottom: 14px;
      }
      .error-message {
        background: #ffebee;
        color: #b71c1c;
      }
      .success-message {
        background: #e8f5e9;
        color: #1b5e20;
      }

      @media (max-width: 720px) {
        .tasks-page {
          padding: 20px 14px;
        }
        .page-header {
          align-items: stretch;
          flex-direction: column;
        }
        .task-form {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class TareasComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  displayedColumns = [
    'titulo',
    'estado',
    'prioridad',
    'usuarioAsignado',
    'fechaLimite',
    'acciones'
  ];
  estados = [
    { id: 1, nombre: 'Pendiente', icon: 'radio_button_unchecked' },
    { id: 2, nombre: 'En Progreso', icon: 'pending_actions' },
    { id: 3, nombre: 'Completada', icon: 'task_alt' },
    { id: 4, nombre: 'Cancelada', icon: 'cancel' }
  ];
  prioridades = [
    { id: 1, nombre: 'Baja' },
    { id: 2, nombre: 'Media' },
    { id: 3, nombre: 'Alta' },
    { id: 4, nombre: 'Critica' }
  ];

  tareas$: Observable<Tarea[]> = this.store.select(selectTareas);
  total$: Observable<number> = this.store.select(selectTareasTotal);
  pagina$: Observable<number> = this.store.select(selectTareasPagina);
  tamanoPagina$: Observable<number> = this.store.select(selectTareasTamanoPagina);
  loading$: Observable<boolean> = this.store.select(selectTareasLoading);
  saving$: Observable<boolean> = this.store.select(selectTareaSaving);
  deletingId$: Observable<number | null> = this.store.select(selectTareaDeletingId);
  changingEstadoId$: Observable<number | null> = this.store.select(selectTareaChangingEstadoId);
  error$: Observable<string | null> = this.store.select(selectTareasError);
  operationError$: Observable<string | null> = this.store.select(selectTareaOperationError);
  lastOperationMessage$: Observable<string | null> = this.store.select(selectTareaLastOperationMessage);
  proyecto$: Observable<Proyecto | null> = this.store.select(selectProyectoSelected);
  isAdmin$: Observable<boolean> = this.store
    .select(selectRol)
    .pipe(map(rol => rol === 'Administrador'));
  isEditor$: Observable<boolean> = this.store
    .select(selectRol)
    .pipe(map(rol => rol === 'Administrador' || rol === 'Colaborador'));
  empty$: Observable<boolean> = combineLatest([
    this.tareas$,
    this.loading$
  ]).pipe(map(([tareas, loading]) => !loading && tareas.length === 0));

  proyectoId: number | null = null;
  showForm = false;
  editingTarea: Tarea | null = null;

  form = this.fb.group(
    {
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      prioridadId: [2, Validators.required],
      usuarioAsignadoId: [null as number | null, [Validators.min(1), Validators.max(3)]],
      fechaLimite: ['', Validators.required]
    }
  );

  ngOnInit(): void {
    const proyectoId = Number(this.route.snapshot.paramMap.get('proyectoId'));

    if (!Number.isFinite(proyectoId) || proyectoId <= 0) {
      this.store.dispatch(TareasActions.loadTareasFailure({
        error: 'No se encontro un proyecto valido para cargar tareas.'
      }));
      return;
    }

    this.proyectoId = proyectoId;
    this.store.dispatch(ProyectosActions.loadProyecto({ id: proyectoId }));
    this.store.dispatch(TareasActions.loadTareas({
      proyectoId,
      pagina: 1,
      tamanoPagina: 10
    }));
  }

  startCreate(): void {
    this.editingTarea = null;
    this.showForm = true;
    this.form.reset({
      titulo: '',
      descripcion: '',
      prioridadId: 2,
      usuarioAsignadoId: null,
      fechaLimite: ''
    });
    this.store.dispatch(TareasActions.clearTareaOperationMessages());
  }

  startEdit(tarea: Tarea): void {
    this.editingTarea = tarea;
    this.showForm = true;
    this.form.reset({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion ?? '',
      prioridadId: tarea.prioridadId,
      usuarioAsignadoId: tarea.usuarioAsignadoId,
      fechaLimite: this.toDateInput(tarea.fechaLimite)
    });
    this.store.dispatch(TareasActions.clearTareaOperationMessages());
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingTarea = null;
    this.form.reset();
    this.store.dispatch(TareasActions.clearTareaOperationMessages());
  }

  submit(): void {
    if (!this.proyectoId) {
      this.store.dispatch(TareasActions.createTareaFailure({
        error: 'No se encontro un proyecto valido para guardar la tarea.'
      }));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      proyectoId: this.proyectoId,
      titulo: value.titulo?.trim() ?? '',
      descripcion: value.descripcion?.trim() || null,
      prioridadId: value.prioridadId ?? 2,
      estadoId: null,
      usuarioAsignadoId: this.toNullableNumber(value.usuarioAsignadoId),
      fechaLimite: value.fechaLimite ?? ''
    };

    if (this.editingTarea) {
      this.store.dispatch(TareasActions.updateTarea({
        id: this.editingTarea.id,
        payload
      }));
      this.showForm = false;
      this.editingTarea = null;
      return;
    }

    this.store.dispatch(TareasActions.createTarea({ payload }));
    this.showForm = false;
  }

  pageChanged(event: PageEvent): void {
    if (!this.proyectoId) {
      return;
    }

    this.store.dispatch(TareasActions.loadTareas({
      proyectoId: this.proyectoId,
      pagina: event.pageIndex + 1,
      tamanoPagina: event.pageSize
    }));
  }

  deleteTarea(tarea: Tarea): void {
    const confirmed = window.confirm(
      `Deseas eliminar la tarea "${tarea.titulo}"?`
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(TareasActions.deleteTarea({ id: tarea.id }));
  }

  changeEstado(tarea: Tarea, estadoId: number): void {
    if (estadoId === tarea.estadoId) {
      return;
    }

    if (estadoId !== 3) {
      this.dispatchChangeEstado(tarea, estadoId);
      return;
    }

    this.proyecto$.pipe(take(1)).subscribe(proyecto => {
      if (proyecto?.estadoId === 4) {
        const confirmed = window.confirm(
          'El proyecto esta cancelado. El backend rechazara completar esta tarea. Deseas continuar?'
        );

        if (!confirmed) {
          return;
        }
      }

      this.dispatchChangeEstado(tarea, estadoId);
    });
  }

  getEstadoOptionsForTarea(tarea: Tarea): typeof this.estados {
    if (tarea.estadoId === 1) {
      return this.estados.filter(estado => estado.id === 2 || estado.id === 4);
    }

    if (tarea.estadoId === 2) {
      return this.estados.filter(estado => estado.id !== 2);
    }

    if (tarea.estadoId === 3) {
      return this.estados.filter(estado => estado.id === 2);
    }

    if (tarea.estadoId === 4) {
      return this.estados.filter(estado => estado.id === 1);
    }

    return this.estados.filter(estado => estado.id !== tarea.estadoId);
  }

  isOverdue(tarea: Tarea): boolean {
    if (tarea.estadoId === 3 || tarea.estadoId === 4 || !tarea.fechaLimite) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limite = new Date(tarea.fechaLimite);
    limite.setHours(0, 0, 0, 0);

    return limite < today;
  }

  private toDateInput(value: string): string {
    return value ? value.substring(0, 10) : '';
  }

  private toNullableNumber(value: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 3 ? parsed : null;
  }

  private dispatchChangeEstado(tarea: Tarea, estadoId: number): void {
    this.store.dispatch(TareasActions.changeEstadoTarea({
      id: tarea.id,
      payload: { estadoId }
    }));
  }
}
