import { AsyncPipe, CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Store } from "@ngrx/store";
import { combineLatest, map, Observable } from "rxjs";
import { Proyecto } from "../../core/models/api.models";
import { selectRol } from "../../state/session-state/redux/selectors";
import * as ProyectosActions from "../../state/proyectos-state/redux/actions/proyectos.actions";
import {
  selectProyectoDeletingId,
  selectProyectoLastOperationMessage,
  selectProyectoOperationError,
  selectProyectoSaving,
  selectProyectos,
  selectProyectosError,
  selectProyectosLoading,
  selectProyectosPagina,
  selectProyectosTamanoPagina,
  selectProyectosTotal,
} from "../../state/proyectos-state/redux/selectors";

// TODO: Implement the Projects feature.
//
// This module/component should include:
//   1. A paginated list of projects (server-side pagination)
//      - Columns: Nombre, Estado, FechaInicio, FechaFin, CreadoPor, Actions
//      - Use Angular Material table + paginator
//   2. Create project dialog/form (Admin only — hide button for other roles)
//   3. Edit project dialog/form (Admin only)
//   4. Delete project with confirmation dialog (Admin only)
//      — Show error message if backend rejects due to business rule
//
// NgRx requirements:
//   - proyectos state: actions, effects, reducer, selectors
//   - Effects must use ProyectosService (core/services/proyectos.service.ts) — do not call HttpClient directly
//   - Use NgRx selectors in the template (no direct service calls from components)
//
// Role-based UI:
//   - Show/hide action buttons based on current user role from selectRol selector
//   - Colaborador and Visualizador should see read-only list

@Component({
  selector: "app-proyectos",
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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="app-title">Gestion de Proyectos</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/home">
        <mat-icon>dashboard</mat-icon>
        Inicio
      </a>
    </mat-toolbar>

    <main class="projects-page">
      <section class="page-header">
        <div>
          <h2>Proyectos</h2>
          <p>Listado paginado y administracion de proyectos.</p>
        </div>

        @if (isAdmin$ | async) {
          <button
            mat-flat-button
            color="primary"
            type="button"
            (click)="startCreate()"
          >
            <mat-icon>add</mat-icon>
            Nuevo proyecto
          </button>
        }
      </section>

      @if (showForm) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{
              editingProyecto ? "Editar proyecto" : "Crear proyecto"
            }}</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form class="project-form" [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" maxlength="120" />
                @if (form.controls.nombre.hasError("required")) {
                  <mat-error>El nombre es requerido.</mat-error>
                }
                @if (form.controls.nombre.hasError("minlength")) {
                  <mat-error
                    >El nombre debe tener al menos 3 caracteres.</mat-error
                  >
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

              <mat-form-field appearance="outline">
                <mat-label>Fecha inicio</mat-label>
                <input matInput type="date" formControlName="fechaInicio" />
                @if (form.controls.fechaInicio.hasError("required")) {
                  <mat-error>La fecha de inicio es requerida.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha fin</mat-label>
                <input matInput type="date" formControlName="fechaFin" />
                @if (form.controls.fechaFin.hasError("required")) {
                  <mat-error>La fecha fin es requerida.</mat-error>
                }
                @if (form.hasError("fechaFinAntesDeInicio")) {
                  <mat-error
                    >La fecha fin debe ser mayor o igual a la fecha
                    inicio.</mat-error
                  >
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estadoId">
                  @for (estado of estados; track estado.id) {
                    <mat-option [value]="estado.id">{{
                      estado.nombre
                    }}</mat-option>
                  }
                </mat-select>
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
              [dataSource]="(proyectos$ | async) ?? []"
              class="projects-table"
            >
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let proyecto">
                  {{ proyecto.nombre }}
                </td>
              </ng-container>

              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let proyecto">
                  <span class="status-pill">{{ proyecto.estadoNombre }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="fechaInicio">
                <th mat-header-cell *matHeaderCellDef>Fecha inicio</th>
                <td mat-cell *matCellDef="let proyecto">
                  {{ proyecto.fechaInicio | date: "yyyy-MM-dd" }}
                </td>
              </ng-container>

              <ng-container matColumnDef="fechaFin">
                <th mat-header-cell *matHeaderCellDef>Fecha fin</th>
                <td mat-cell *matCellDef="let proyecto">
                  {{ proyecto.fechaFin | date: "yyyy-MM-dd" }}
                </td>
              </ng-container>

              <ng-container matColumnDef="creadoPor">
                <th mat-header-cell *matHeaderCellDef>Creado por</th>
                <td mat-cell *matCellDef="let proyecto">
                  {{ proyecto.creadoPorNombre }}
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let proyecto">
                  <div class="row-actions">
                    <a
                      mat-icon-button
                      [routerLink]="['/proyectos', proyecto.id, 'tareas']"
                      title="Ver tareas"
                    >
                      <mat-icon>assignment</mat-icon>
                    </a>

                    @if (isAdmin$ | async) {
                      <button
                        mat-icon-button
                        type="button"
                        (click)="startEdit(proyecto)"
                        title="Editar"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        type="button"
                        color="warn"
                        (click)="deleteProyecto(proyecto)"
                        [disabled]="(deletingId$ | async) === proyecto.id"
                        title="Eliminar"
                      >
                        @if ((deletingId$ | async) === proyecto.id) {
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
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            @if (loading$ | async) {
              <div class="table-loading">
                <mat-spinner diameter="32" />
                <span>Cargando proyectos...</span>
              </div>
            }

            @if (empty$ | async) {
              <p class="empty-state">No hay proyectos para mostrar.</p>
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
      .projects-page {
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
      .project-form {
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
      .form-actions button {
        min-width: 104px;
      }
      .form-actions mat-spinner {
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
      .projects-table {
        width: 100%;
        min-width: 760px;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 2px 10px;
        border-radius: 999px;
        background: #e8f2ff;
        color: #145ea8;
        font-size: 0.82rem;
        font-weight: 500;
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
        .projects-page {
          padding: 20px 14px;
        }
        .page-header {
          align-items: stretch;
          flex-direction: column;
        }
        .project-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProyectosComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  displayedColumns = [
    "nombre",
    "estado",
    "fechaInicio",
    "fechaFin",
    "creadoPor",
    "acciones",
  ];
  estados = [
    { id: 1, nombre: "Pendiente" },
    { id: 2, nombre: "En Progreso" },
    { id: 3, nombre: "Completada" },
    { id: 4, nombre: "Cancelada" },
  ];

  proyectos$: Observable<Proyecto[]> = this.store.select(selectProyectos);
  total$: Observable<number> = this.store.select(selectProyectosTotal);
  pagina$: Observable<number> = this.store.select(selectProyectosPagina);
  tamanoPagina$: Observable<number> = this.store.select(
    selectProyectosTamanoPagina,
  );
  loading$: Observable<boolean> = this.store.select(selectProyectosLoading);
  saving$: Observable<boolean> = this.store.select(selectProyectoSaving);
  deletingId$: Observable<number | null> = this.store.select(
    selectProyectoDeletingId,
  );
  error$: Observable<string | null> = this.store.select(selectProyectosError);
  operationError$: Observable<string | null> = this.store.select(
    selectProyectoOperationError,
  );
  lastOperationMessage$: Observable<string | null> = this.store.select(
    selectProyectoLastOperationMessage,
  );
  isAdmin$: Observable<boolean> = this.store
    .select(selectRol)
    .pipe(map((rol) => rol === "Administrador"));
  empty$: Observable<boolean> = combineLatest([
    this.proyectos$,
    this.loading$,
  ]).pipe(map(([proyectos, loading]) => !loading && proyectos.length === 0));

  showForm = false;
  editingProyecto: Proyecto | null = null;

  form = this.fb.group(
    {
      nombre: ["", [Validators.required, Validators.minLength(3)]],
      descripcion: [""],
      fechaInicio: ["", Validators.required],
      fechaFin: ["", Validators.required],
      estadoId: [1, Validators.required],
    },
    { validators: this.fechaFinValidator },
  );

  ngOnInit(): void {
    this.store.dispatch(
      ProyectosActions.loadProyectos({ pagina: 1, tamanoPagina: 10 }),
    );
  }

  startCreate(): void {
    this.editingProyecto = null;
    this.showForm = true;
    this.form.reset({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      estadoId: 1,
    });
    this.store.dispatch(ProyectosActions.clearProyectoOperationMessages());
  }

  startEdit(proyecto: Proyecto): void {
    this.editingProyecto = proyecto;
    this.showForm = true;
    this.form.reset({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? "",
      fechaInicio: this.toDateInput(proyecto.fechaInicio),
      fechaFin: this.toDateInput(proyecto.fechaFin),
      estadoId: proyecto.estadoId,
    });
    this.store.dispatch(ProyectosActions.clearProyectoOperationMessages());
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProyecto = null;
    this.form.reset();
    this.store.dispatch(ProyectosActions.clearProyectoOperationMessages());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const basePayload = {
      nombre: value.nombre?.trim() ?? "",
      descripcion: value.descripcion?.trim() || null,
      fechaInicio: value.fechaInicio ?? "",
      fechaFin: value.fechaFin ?? "",
      estadoId: value.estadoId ?? 1,
    };

    if (this.editingProyecto) {
      this.store.dispatch(
        ProyectosActions.updateProyecto({
          id: this.editingProyecto.id,
          payload: basePayload,
        }),
      );
      this.showForm = false;
      this.editingProyecto = null;
      return;
    }

    this.store.dispatch(
      ProyectosActions.createProyecto({
        payload: basePayload,
      }),
    );
    this.showForm = false;
  }

  pageChanged(event: PageEvent): void {
    this.store.dispatch(
      ProyectosActions.loadProyectos({
        pagina: event.pageIndex + 1,
        tamanoPagina: event.pageSize,
      }),
    );
  }

  deleteProyecto(proyecto: Proyecto): void {
    const confirmed = window.confirm(
      `Deseas eliminar el proyecto "${proyecto.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(ProyectosActions.deleteProyecto({ id: proyecto.id }));
  }

  private fechaFinValidator(control: AbstractControl): ValidationErrors | null {
    const fechaInicio = control.get("fechaInicio")?.value;
    const fechaFin = control.get("fechaFin")?.value;

    if (!fechaInicio || !fechaFin) {
      return null;
    }

    return fechaFin >= fechaInicio ? null : { fechaFinAntesDeInicio: true };
  }

  private toDateInput(value: string): string {
    return value ? value.substring(0, 10) : "";
  }

}
