import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMsg = '';
                if (error.error instanceof ErrorEvent) {
                    // Client side error
                    errorMsg = `Error: ${error.error.message}`;
                } else {
                    // Server side error
                    errorMsg = error.error?.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
                }
                console.error('HTTP Error Intercepted:', errorMsg);
                // Additional logging service or UI toast notification can be triggered here
                return throwError(() => new Error(errorMsg));
            })
        );
    }
}
