import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as SessionActions from '../../state/session-state/redux/actions/session.actions';

/**
 * TODO: Implement HTTP error interceptor.
 *
 * This interceptor should handle error responses globally:
 *
 *   - 401 Unauthorized  → dispatch logout action to the NgRx store and redirect to /login
 *   - 403 Forbidden     → redirect to /forbidden
 *   - 500 / network err → display a global error notification (use console.error at minimum,
 *                         or integrate with a snackbar/notification service)
 *
 * The interceptor must:
 *   - Use Angular's functional interceptor signature (HttpInterceptorFn)
 *   - Use `inject()` to get dependencies (Router, Store)
 *   - Re-throw the error after handling so individual components can still react if needed
 *
 * Register it in app.config.ts alongside jwtInterceptor.
 *
 * Example skeleton:
 *
 *   return next(req).pipe(
 *     catchError((error: HttpErrorResponse) => {
 *       // handle by status code
 *       return throwError(() => error);
 *     })
 *   );
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        store.dispatch(SessionActions.logout());
      } else if (error.status === 403) {
        router.navigate(['/forbidden']);
      } else if (error.status === 0 || error.status >= 500) {
        console.error('HTTP error', error);
      }

      return throwError(() => error);
    })
  );
};
