import { Component } from '@angular/core';
import { ChatState } from './chat-state.enum';
import { IMessage } from 'src/app/domain/message.interface';
import { MessageAuthor } from 'src/app/domain/message-author.enum';
import { FindStrangerNostr } from '@shared/omegle-service/find-stranger.nostr';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  readonly STATE_CONNECTED = ChatState.CONNECTED;
  readonly STATE_UP_TO_DISCONNECT = ChatState.UP_TO_DISCONNECT;
  readonly STATE_DISCONNECTED = ChatState.DISCONNECTED;

  readonly AUTHOR_STRANGE = MessageAuthor.STRANGE;
  readonly AUTHOR_YOU = MessageAuthor.YOU;

  currentState = ChatState.DISCONNECTED;

  currentOnline = 0;

  messages: IMessage[] = [
    {
      author: MessageAuthor.STRANGE,
      text: 'hi',
      time: new Date().getTime()
    },

    {
      author: MessageAuthor.YOU,
      text: 'hi tudo bem',
      time: new Date().getTime()
    },

    {
      author: MessageAuthor.STRANGE,
      text: 'tudo bom nada',
      time: new Date().getTime()
    }
  ];

  constructor(
    findStrangerNostr: FindStrangerNostr
  ) {}

  sendMessage(message: string): void {

  }
}
