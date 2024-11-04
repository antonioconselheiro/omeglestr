import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from '@domain/chat-message.interface';
import { MessageAuthor } from '@domain/message-author.enum';
import { NostrEvent } from '@nostrify/nostrify';
import { Subscription } from 'rxjs';
import { ChatState } from './chat-state.enum';
import { ModalService } from '@belomonte/async-modal-ngx';
import { RelayConfigComponent } from '@shared/relay-config/relay-config.component';
import { GlobalErrorHandler } from '@shared/error-handling/global.error-handler';
import { SoundNotificationService } from '@shared/sound/sound-notification.service';
import {FindStrangerService, NostrPublicUser, TalkToStrangerNostr } from '@belomonte/ngx-parody-api';

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

  @ViewChild('conversation')
  conversationEl!: ElementRef;

  typingTimeoutId = 0;
  currentOnline = 1;
  strangeIsTyping = false;
  currentState = ChatState.DISCONNECTED;
  whoDisconnected: MessageAuthor | null = null;

  stranger: NostrPublicUser | null = null;

  messages: Array<[ChatMessage, string | null]> = [];

  controller = new AbortController();

  private subscriptions = new Subscription();

  constructor(
    private globalErrorHandler: GlobalErrorHandler,
    private findStrangerProxy: FindStrangerService,
    private talkToStrangerNostr: TalkToStrangerNostr,
    private soundNotificationService: SoundNotificationService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.countStrangers();
  }
  
  private countStrangers(): void {
    this.subscriptions.add(this.talkToStrangerNostr
      .listenCurrenOnlineUsers()
      .subscribe(currentOnline => this.currentOnline = currentOnline || 1));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:beforeunload')
  async onBeforeUnload(): Promise<true> {
    await this.endSession();
    return true;
  }

  configRelays(): void {
    this.modalService
      .createModal(RelayConfigComponent)
      .build();
  }

  findStranger(): void {
    this.whoDisconnected = null;
    this.currentState = this.stateSearchingStranger;
    this.messages = [];
    this.findStrangerProxy.createSession();

    this.findStrangerProxy
      .searchStranger({ signal: this.controller.signal })
      .then(stranger => this.startConversation(stranger))
      .catch(e => {
        console.error(new Date().toLocaleString(), e);
        this.currentState = ChatState.DISCONNECTED;
        this.strangeIsTyping = false;
        this.whoDisconnected = null;
        this.stranger = null;

        throw e;
      });
  }

  endSession(): Promise<void> {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    this.stranger = null;
    return this.findStrangerProxy
      .endSession()
      .then(() => {
        this.currentState = ChatState.DISCONNECTED;
        this.strangeIsTyping = false;

        if (!this.whoDisconnected) {
          this.whoDisconnected = MessageAuthor.YOU;
        }

        return Promise.resolve();
      });
  }

  private startConversation(stranger: NostrPublicUser): void {
    console.log(new Date().toLocaleString(), 'starting conversation, stranger: ', stranger);
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;
    if (this.currentOnline === 1) {
      this.currentOnline = 2;
    }

    this.soundNotificationService.notify();
    this.subscriptions.add(this.talkToStrangerNostr
      .listenMessages(stranger)
      .subscribe({
        next: event => this.addMessageFromStranger(stranger, event)
      }));

    this.subscriptions.add(this.talkToStrangerNostr
      .listenStrangerStatus(stranger)
      .subscribe({
        next: event => this.handleStrangerStatus(event)
      }));
  }

  private addMessageFromStranger(stranger: NostrPublicUser, event: NostrEvent): void {
    this.talkToStrangerNostr
      .openEncryptedDirectMessage(stranger, event)
      .then(text => {
        this.messages.push([{
          text,
          author: MessageAuthor.STRANGE,
          time: event.created_at
        }, null]);
        this.scrollConversationToTheEnd();
      })
  }

  private handleStrangerStatus(event: NostrEvent): void {
    if (event.content === 'typing') {
      this.strangeIsTyping = true;
      this.scrollConversationToTheEnd();
    } else if (event.content === 'disconnected') {
      this.strangeIsTyping = false;
      this.whoDisconnected = MessageAuthor.STRANGE;
      this.currentState = ChatState.DISCONNECTED;
      this.endSession();
    } else {
      this.strangeIsTyping = false;
    }
  }

  async sendMessage(message: string): Promise<void> {
    const stranger = this.stranger;
    if (stranger && message.length) {
      const touple: [ChatMessage, string | null] = [{
        author: MessageAuthor.YOU,
        text: message,
        time: Math.floor(new Date().getTime() / 1000)
      }, null];

      this.messages.push(touple);
      this.scrollConversationToTheEnd();

      try {
        await this.talkToStrangerNostr.sendMessage(stranger, message);
      } catch (e) {
        touple[1] = this.globalErrorHandler.getErrorMessage(e as Error).join('; ');
      }
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

  stopSearching(): void {
    this.controller.abort();
    this.endSession();
  }

  onTyping(): void {
    if (!this.typingTimeoutId) {
      this.talkToStrangerNostr.isTyping();
    }

    clearTimeout(this.typingTimeoutId);
    this.typingTimeoutId = Number(setTimeout(() => {
      this.talkToStrangerNostr.stopTyping();
      this.typingTimeoutId = 0;
    }, this.typingTimeoutAmount));
  }
}
