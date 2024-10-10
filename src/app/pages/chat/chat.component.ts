import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MessageAuthor } from '@domain/message-author.enum';
import { ChatMessage } from '@domain/chat-message.interface';
import { NostrUser } from '@domain/nostr-user';
import { FindStrangerService } from '@shared/omegle-service/find-stranger.service';
import { TalkToStrangerNostr } from '@shared/omegle-service/talk-to-stranger.nostr';
import { ChatState } from './chat-state.enum';
import { NostrEvent } from '@nostrify/nostrify';
import { Subscription } from 'rxjs';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnDestroy, OnInit {

  readonly STATE_CONNECTED = ChatState.CONNECTED;
  readonly STATE_UP_TO_DISCONNECT = ChatState.UP_TO_DISCONNECT;
  readonly STATE_DISCONNECTED = ChatState.DISCONNECTED;
  readonly STATE_SEARCHING_STRANGER = ChatState.SEARCHING_STRANGER;

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

  private subscriptions = new Subscription();

  constructor(
    private findStrangerProxy: FindStrangerService,
    private talkToStrangerNostr: TalkToStrangerNostr
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.talkToStrangerNostr
      .listenCurrenOnlineUsers()
      .subscribe(currentOnline => this.currentOnline = currentOnline));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:beforeunload')
  async onBeforeUnload(): Promise<true> {
    await this.disconnect();
    return true;
  }

  findStranger(): void {
    this.whoDisconnected = null;
    this.currentState = this.STATE_SEARCHING_STRANGER;
    this.messages = [];
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
    this.subscriptions.add(this.talkToStrangerNostr
      .listenMessages(me, stranger)
      .subscribe({
        next: event => this.addMessageFromStranger(me, stranger, event)
      }));

    this.subscriptions.add(this.talkToStrangerNostr
      .listenStrangerStatus(stranger)
      .subscribe({
        next: event => this.handleStrangerStatus(event)
      }));
  }

  private addMessageFromStranger(me: Required<NostrUser>, stranger: NostrUser, event: NostrEvent): void {
    this.talkToStrangerNostr
      .openEncryptedDirectMessage(me, stranger, event)
      .then(text => {
        this.messages.push({
          text,
          author: MessageAuthor.STRANGE,
          time: event.created_at
        });
      })
  }

  private handleStrangerStatus(event: NostrEvent): void {
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
      this.talkToStrangerNostr.sendMessage(me, stranger, message);
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
        this.talkToStrangerNostr.isTyping(you);
      }

      clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = Number(setTimeout(() => {
        this.talkToStrangerNostr.stopTyping(you);
        this.typingTimeoutId = 0;
      }, this.TYPING_TIMEOUT));
    }
  }
}
