import { Component } from '@angular/core';
import { MessageAuthor } from '@domain/message-author.enum';
import { IMessage } from '@domain/message.interface';
import { NostrUser } from '@domain/nostr-user';
import { FindStrangerProxy } from '@shared/omegle-service/find-stranger.proxy';
import { TalkToStrangerProxy } from '@shared/omegle-service/talk-to-stranger.proxy';
import { ChatState } from './chat-state.enum';

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

  readonly TYPING_TIMEOUT = 3_000;

  typingTimeoutId = 0;
  currentState = ChatState.DISCONNECTED;
  currentOnline = 0;

  you: Required<NostrUser> | null = null;
  stranger: NostrUser | null = null;

  messages: IMessage[] = [];

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
    const you = this.you;
    const stranger = this.stranger;
    if (you && stranger) {
      this.talkToStrangerProxy.sendMessage(you, stranger, message);
    }
  }

  onTyping(): void {
    const you = this.you;
    if (you) {
      this.talkToStrangerProxy.isTyping(you);
      clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = Number(setTimeout(() => {
        this.talkToStrangerProxy.stopTyping(you);
      }, this.TYPING_TIMEOUT));
    }
  }
}
