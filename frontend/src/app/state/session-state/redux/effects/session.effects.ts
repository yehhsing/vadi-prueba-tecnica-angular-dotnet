import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Router } from "@angular/router";
import { catchError, map, of, switchMap, tap } from "rxjs";
import * as SessionActions from "../actions/session.actions";
import { AuthService } from "../../../../core/services/auth.service";

@Injectable()
export class SessionEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) =>
            SessionActions.loginSuccess({
              token: response.data.token,
              nombre: response.data.nombre,
              email: response.data.email,
              rol: response.data.rol,
            }),
          ),
          catchError((err) =>
            of(
              SessionActions.loginFailure({
                error: err.error?.message ?? "Error al iniciar sesión",
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SessionActions.loginSuccess),
        tap(({ token, nombre, email, rol }) => {
          localStorage.setItem("token", token);
          localStorage.setItem("nombre", nombre);
          localStorage.setItem("email", email);
          localStorage.setItem("rol", rol);
          this.router.navigate(["/home"]);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SessionActions.logout),
        tap(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("nombre");
          localStorage.removeItem("email");
          localStorage.removeItem("rol");
          this.router.navigate(["/login"]);
        }),
      ),
    { dispatch: false },
  );
}
