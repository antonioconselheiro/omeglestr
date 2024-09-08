import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './pages/chat/chat.module';
import { NostrModule } from './shared/nostr/nostr.module';
import { GlobalConfigModule } from '@shared/global-config/global-config.module';
import { OmegleServiceModule } from '@shared/omegle-service/omegle-service.module';

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
    NostrModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
