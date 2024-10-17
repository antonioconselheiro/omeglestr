import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { AuthorPipe } from './author.pipe';
import { RelayConfigModule } from '@shared/relay-config/relay-config.module';

@NgModule({
  declarations: [
    ChatComponent,
    AuthorPipe
  ],
  imports: [
    CommonModule,
    RelayConfigModule
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule { }
