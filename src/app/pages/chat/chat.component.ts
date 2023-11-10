import { Component } from '@angular/core';
import { ChatState } from './chat-state.enum';
import { IMessage } from 'src/app/domain/message.interface';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  readonly STATE_CONNECTED = ChatState.CONNECTED;
  readonly STATE_UP_TO_DISCONNECT = ChatState.UP_TO_DISCONNECT;
  readonly STATE_DISCONNECTED = ChatState.DISCONNECTED;

  state = ChatState.DISCONNECTED;

  currentOnline = 0;

  messages: IMessage[] = [];

  sendMessage(message: string): void {

  }
}
