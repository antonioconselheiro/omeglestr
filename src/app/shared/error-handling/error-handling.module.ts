import { CommonModule } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalErrorHandler } from './global.error-handler';
import { ErrorMessagesObservable } from './error-messages.observable';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule
  ],
  providers: [
    ErrorMessagesObservable,
    GlobalErrorHandler,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
})
export class ErrorHandlingModule { }
