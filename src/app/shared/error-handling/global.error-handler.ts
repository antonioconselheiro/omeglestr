import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorMessagesObservable } from './error-messages.observable';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler extends ErrorHandler {

  constructor(
    private error$: ErrorMessagesObservable
  ) { 
    super();
  }

  override handleError(error: Error & { errors?: Array<Error> }): void {
    if (!(/^AbortError/.test(String(error)))) {
      if (error.errors && error.errors.length) {
        error.errors.forEach(err => {
          console.error(new Date().toLocaleString(), err.message);
          this.error$.next(err.message);
        });
      } else if (error.message) {
        console.error(new Date().toLocaleString(), error.message);
        this.error$.next(error.message);
      } else {
        console.error(new Date().toLocaleString(), 'application throw unkown error');
        this.error$.next('application throw unkown error');
      }
    }
  }

  getErrorMessage(error: Error & { errors?: Array<Error> }): string[] {
    if (!(/^AbortError/.test(String(error)))) {
      if (error.errors && error.errors.length) {
        return error.errors.map(err => err.message);
      } else if (error.message) {
        return [error.message];
      }
    }

    return [];
  }
}
