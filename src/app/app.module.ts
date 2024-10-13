import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GlobalConfigModule } from '@shared/global-config/global-config.module';
import { OmegleServiceModule } from '@shared/omegle-service/omegle-service.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './pages/chat/chat.module';
import { NostrModule } from './shared/nostr/nostr.module';
import { ErrorHandlingModule } from '@shared/error-handling/error-handling.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ChatModule,
    BrowserModule,
    AppRoutingModule,
    GlobalConfigModule,
    OmegleServiceModule,
    NostrModule,
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
