import { Component } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { FindStrangerProxy } from '@shared/omegle-service/find-stranger.proxy';
import { MessageAuthor } from '../../domain/message-author.enum';
import { IMessage } from '../../domain/message.interface';
import { ChatState } from './chat-state.enum';
import { TalkToStrangerProxy } from '@shared/omegle-service/talk-to-stranger.proxy';

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

  you: Required<NostrUser> | null = null;
  stranger: NostrUser | null = null;

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
    private findStrangerProxy: FindStrangerProxy,
    private talkToStrangerProxy: TalkToStrangerProxy
  ) { }

  onClickStart(): void {
    this.you = this.findStrangerProxy.connect();
    this.findStrangerProxy
      .searchStranger(this.you)
      .then(stranger => this.startConversation(stranger))
      .catch(e => console.error(e));
  }

  private startConversation(stranger: NostrUser): void {
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;
  }

  sendMessage(message: string): void {

  }
}
