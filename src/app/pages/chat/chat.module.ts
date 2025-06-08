import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RelayConfigModule } from '@shared/relay-config/relay-config.module';
import { SoundModule } from '@shared/sound/sound.module';
import { AuthorPipe } from './author.pipe';
import { ChatComponent } from './chat.component';
import { TypingStatusDirective } from '@belomonte/ngx-parody-api';

@NgModule({
  declarations: [
    ChatComponent,
    AuthorPipe
  ],
  imports: [
    CommonModule,
    SoundModule,
    RelayConfigModule,
    TypingStatusDirective
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule { }
