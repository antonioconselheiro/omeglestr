import { Component, HostListener } from '@angular/core';
import { MessageAuthor } from '@domain/message-author.enum';
import { ChatMessage } from '@domain/chat-message.interface';
import { NostrUser } from '@domain/nostr-user';
import { FindStrangerService } from '@shared/omegle-service/find-stranger.service';
import { TalkToStrangerNostr } from '@shared/omegle-service/talk-to-stranger.nostr';
import { ChatState } from './chat-state.enum';
import { Event } from 'nostr-tools';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent {

  readonly STATE_CONNECTED = ChatState.CONNECTED;
  readonly STATE_UP_TO_DISCONNECT = ChatState.UP_TO_DISCONNECT;
  readonly STATE_DISCONNECTED = ChatState.DISCONNECTED;

  readonly AUTHOR_STRANGE = MessageAuthor.STRANGE;
  readonly AUTHOR_YOU = MessageAuthor.YOU;

  readonly TYPING_TIMEOUT = 2_000;

  typingTimeoutId = 0;
  currentOnline = 0;
  currentState = ChatState.DISCONNECTED;
  strangeIsTyping = false;
  whoDisconnected: MessageAuthor | null = null;

  you: Required<NostrUser> | null = null;
  stranger: NostrUser | null = null;

  messages: ChatMessage[] = [];

  constructor(
    private findStrangerProxy: FindStrangerService,
    private talkToStrangerProxy: TalkToStrangerNostr
  ) { }

  @HostListener('window:beforeunload')
  async onBeforeUnload(): Promise<true> {
    if (this.stranger) {
      await this.disconnect();
    }

    return true;
  }

  findStranger(): void {
    this.whoDisconnected = null;
    const you = this.you = this.findStrangerProxy.connect();
    console.info(new Date().toLocaleString(), 'me: ', you);
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
        this.strangeIsTyping = false;

        if (!this.whoDisconnected) {
          this.whoDisconnected = MessageAuthor.YOU;
        }

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

    this.talkToStrangerProxy
      .listenStrangerStatus(stranger)
      .subscribe({
        next: event => this.handleStrangerStatus(event)
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

  private handleStrangerStatus(event: Event): void {
    if (event.content === 'typing') {
      this.strangeIsTyping = true;
    } else if (event.content === 'disconnected') {
      this.strangeIsTyping = false;
      this.whoDisconnected = MessageAuthor.STRANGE;
      this.currentState = ChatState.DISCONNECTED;
      this.disconnect();
    } else {
      this.strangeIsTyping = false;
    }
  }

  sendMessage(message: string): void {
    const me = this.you;
    const stranger = this.stranger;
    if (me && stranger && message.length) {
      this.talkToStrangerProxy.sendMessage(me, stranger, message);
      this.messages.push({
        author: MessageAuthor.YOU, text: message, time: Math.floor(new Date().getTime() / 1000)
      });
    }
  }

  cleanMessageField(el: { value: string }): void {
    setTimeout(() => el.value = '');
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
