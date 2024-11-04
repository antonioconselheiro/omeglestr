import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './pages/chat/chat.module';
import { PoolModule } from './shared/pool/pool.module';
import { ErrorHandlingModule } from '@shared/error-handling/error-handling.module';
import { ToastrModule } from 'ngx-toastr';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ChatModule,
    BrowserModule,
    AppRoutingModule,
    AsyncModalModule,
    PoolModule,
    ToastrModule.forRoot({
      timeOut: 10_000,
      positionClass: 'toast-top-center',
      preventDuplicates: true
    }),
    ErrorHandlingModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
