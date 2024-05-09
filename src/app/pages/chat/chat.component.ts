import { Component } from '@angular/core';
import { MessageAuthor } from '@domain/message-author.enum';
import { IMessage } from '@domain/message.interface';
import { NostrUser } from '@domain/nostr-user';
import { FindStrangerProxy } from '@shared/omegle-service/find-stranger.proxy';
import { TalkToStrangerProxy } from '@shared/omegle-service/talk-to-stranger.proxy';
import { ChatState } from './chat-state.enum';
import { Event } from 'nostr-tools';

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
  currentOnline = 0;
  currentState = ChatState.DISCONNECTED;

  you: Required<NostrUser> | null = null;
  stranger: NostrUser | null = null;

  messages: IMessage[] = [];

  constructor(
    private findStrangerProxy: FindStrangerProxy,
    private talkToStrangerProxy: TalkToStrangerProxy
  ) { }

  findStranger(): void {
    const you = this.you = this.findStrangerProxy.connect();
    this.findStrangerProxy
      .searchStranger(this.you)
      .then(stranger => this.startConversation(you, stranger))
      .catch(e => console.error(e));
  }

  disconnect(): Promise<void> {
    if (this.you) {
      return this.findStrangerProxy
        .disconnect(this.you)
        .then(() => {
          this.currentState = ChatState.DISCONNECTED;
          return Promise.resolve();
        });
    }

    return Promise.resolve();
  }

  private startConversation(me: Required<NostrUser>, stranger: NostrUser): void {
    console.log('starting conversation, stranger: ', stranger);
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;
    this.talkToStrangerProxy
      .listenMessages(me, stranger)
      .subscribe({
        next: event => this.addMessageFromStranger(me, stranger, event)
      });
  }

  private addMessageFromStranger(me: Required<NostrUser>, stranger: NostrUser, event: Event): void {
    this.talkToStrangerProxy
      .openEncryptedDirectMessage(me, stranger, event)
      .then(text => {
        this.messages.push({
          author: MessageAuthor.STRANGE, text, time: event.created_at
        });
      })
  }

  sendMessage(message: string): void {
    const me = this.you;
    const stranger = this.stranger;
    if (me && stranger) {
      this.talkToStrangerProxy.sendMessage(me, stranger, message);
      this.messages.push({
        author: MessageAuthor.YOU, text: message, time: Math.floor(new Date().getTime() / 1000)
      });
    }
  }

  onTyping(): void {
    const you = this.you;
    if (you) {
      if (!this.typingTimeoutId) {
        this.talkToStrangerProxy.isTyping(you);
      }

      clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = Number(setTimeout(() => {
        this.talkToStrangerProxy.stopTyping(you);
        this.typingTimeoutId = 0;
      }, this.TYPING_TIMEOUT));
    }
  }
}
