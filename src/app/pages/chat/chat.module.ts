import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { AuthorPipe } from './author.pipe';

@NgModule({
  declarations: [
    ChatComponent,
    AuthorPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule { }
