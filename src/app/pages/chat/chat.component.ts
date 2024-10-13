import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from '@domain/chat-message.interface';
import { MessageAuthor } from '@domain/message-author.enum';
import { OmeglestrUser } from '@domain/omeglestr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { FindStrangerService } from '@shared/omegle-service/find-stranger.service';
import { TalkToStrangerNostr } from '@shared/omegle-service/talk-to-stranger.nostr';
import { Subscription } from 'rxjs';
import { ChatState } from './chat-state.enum';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnDestroy, OnInit {

  readonly stateConnected = ChatState.CONNECTED;
  readonly stateUpToDisconnect = ChatState.UP_TO_DISCONNECT;
  readonly stateDisconnected = ChatState.DISCONNECTED;
  readonly stateSearchingStranger = ChatState.SEARCHING_STRANGER;

  readonly authorStrange = MessageAuthor.STRANGE;
  readonly authorYou = MessageAuthor.YOU;

  readonly typingTimeoutAmount = 2_000;

  @ViewChild('conversation') conversationEl!: ElementRef;

  typingTimeoutId = 0;
  currentOnline = 1;
  strangeIsTyping = false;
  currentState = ChatState.DISCONNECTED;
  whoDisconnected: MessageAuthor | null = null;

  you: Required<OmeglestrUser> | null = null;
  stranger: OmeglestrUser | null = null;

  messages: ChatMessage[] = [];

  private subscriptions = new Subscription();

  constructor(
    private findStrangerProxy: FindStrangerService,
    private talkToStrangerNostr: TalkToStrangerNostr
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.talkToStrangerNostr
      .listenCurrenOnlineUsers()
      .subscribe(currentOnline => this.currentOnline = currentOnline || 1));
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
    this.currentState = this.stateSearchingStranger;
    this.messages = [];
    const you = this.you = this.findStrangerProxy.connect();
    console.info(new Date().toLocaleString(), 'me: ', you.pubkey);
    this.findStrangerProxy
      .searchStranger(this.you)
      .then(stranger => this.startConversation(you, stranger))
      .catch(e => console.error(new Date().toLocaleString(), e));
  }

  disconnect(): Promise<void> {
    if (this.you) {
      this.stranger = null;
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

  private startConversation(me: Required<OmeglestrUser>, stranger: OmeglestrUser): void {
    console.log(new Date().toLocaleString(), 'starting conversation, stranger: ', stranger);
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;
    if (this.currentOnline === 1) {
      this.currentOnline = 2;
    }

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

  private addMessageFromStranger(me: Required<OmeglestrUser>, stranger: OmeglestrUser, event: NostrEvent): void {
    this.talkToStrangerNostr
      .openEncryptedDirectMessage(me, stranger, event)
      .then(text => {
        this.messages.push({
          text,
          author: MessageAuthor.STRANGE,
          time: event.created_at
        });
        this.scrollConversationToTheEnd();
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
      this.scrollConversationToTheEnd();
    }
  }

  scrollConversationToTheEnd(): void {
    setTimeout(() => {
      const el = this.conversationEl.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
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
      }, this.typingTimeoutAmount));
    }
  }
}
