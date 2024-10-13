import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
          console.error(err.message);
          this.error$.next(err.message);
        });
      } else if (error.message) {
        console.error(error.message);
        this.error$.next(error.message);
      } else {
        console.error('application throw unkown error');
        this.error$.next('application throw unkown error');
      }
    }
  }
}
