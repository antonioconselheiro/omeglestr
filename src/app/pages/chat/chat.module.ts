import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { AuthorPipe } from './author.pipe';
import { RelayConfigModule } from '@shared/relay-config/relay-config.module';
import { SoundModule } from '@shared/sound/sound.module';

@NgModule({
  declarations: [
    ChatComponent,
    AuthorPipe
  ],
  imports: [
    CommonModule,
    SoundModule,
    RelayConfigModule
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule { }
