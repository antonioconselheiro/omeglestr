import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorMessagesObservable } from './error-messages.observable';
import { log } from '@belomonte/ngx-parody-api';

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
    if (!(/AbortSignal/.test(String(error)))) {
      if (error.errors && error.errors.length) {
        error.errors.forEach(err => {
          log.error(err.message);
          this.error$.next(err.message);
        });
      } else if (error.message) {
        log.error(error.message);
        this.error$.next(error.message);
      } else {
        log.error('application throw unkown error', error);
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
