import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './pages/chat/chat.module';
import { NostrApiModule } from './shared/nostr-api/nostr-api.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ChatModule,
    BrowserModule,
    AppRoutingModule,
    NostrApiModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
