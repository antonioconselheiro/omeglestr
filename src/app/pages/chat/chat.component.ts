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
import { FindStrangerParody, NostrPublicUser, TalkToStrangerParody } from '@belomonte/ngx-parody-api';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnDestroy, OnInit {

  readonly stateConnected = ChatState.CONNECTED;
  readonly stateUpToDisconnect = ChatState.UP_TO_DISCONNECT;
  readonly stateDisconnected = ChatState.DISCONNECTED;
  readonly stateSearchingStranger = ChatState.SEARCHING_STRANGER;

  readonly authorStranger = MessageAuthor.STRANGER;
  readonly authorYou = MessageAuthor.YOU;

  readonly typingTimeoutAmount = 2_000;

  @ViewChild('conversation')
  conversationEl!: ElementRef;

  typingTimeoutId = 0;
  currentOnline = 1;
  strangerIsTyping = false;
  currentState = ChatState.DISCONNECTED;
  whoDisconnected: MessageAuthor | null = null;

  stranger: NostrPublicUser | null = null;

  messages: Array<[ChatMessage, string | null]> = [];

  controller = new AbortController();

  private subscriptions = new Subscription();

  constructor(
    private globalErrorHandler: GlobalErrorHandler,
    private findStrangerParody: FindStrangerParody,
    private talkToStrangerParody: TalkToStrangerParody,
    private soundNotificationService: SoundNotificationService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.countStrangers();
  }
  
  private countStrangers(): void {
    this.subscriptions.add(this.talkToStrangerParody
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

    this.findStrangerParody
      .searchStranger({
        signal: this.controller.signal,
        searchTags: [ 'omegle' ],
        userTags: [ 'omegle' ]
      })
      .then(stranger => this.startConversation(stranger))
      .catch(e => {
        console.error(new Date().toLocaleString(), e);
        this.clearSession();
        throw e;
      });
  }

  clearSession(): void {
    this.currentState = ChatState.DISCONNECTED;
    this.strangerIsTyping = false;
    this.whoDisconnected = null;
    this.stranger = null;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  endSession(): Promise<void> {
    return this.findStrangerParody
      .endSession()
      .then(() => this.clearSession());
  }

  private startConversation(stranger: NostrPublicUser): void {
    console.log(new Date().toLocaleString(), 'starting conversation, stranger: ', stranger);
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;
    if (this.currentOnline === 1) {
      this.currentOnline = 2;
    }

    this.soundNotificationService.notify();
    this.subscriptions.add(this.talkToStrangerParody
      .listenMessages(stranger)
      .subscribe({
        next: event => this.addMessageFromStranger(stranger, event)
      }));

    this.subscriptions.add(this.talkToStrangerParody
      .listenStrangerStatus(stranger)
      .subscribe({
        next: event => this.handleStrangerStatus(event)
      }));
  }

  private addMessageFromStranger(stranger: NostrPublicUser, event: NostrEvent): void {
    this.talkToStrangerParody
      .openEncryptedDirectMessage(stranger, event)
      .then(text => {
        this.messages.push([{
          text,
          author: MessageAuthor.STRANGER,
          time: event.created_at
        }, null]);
        this.scrollConversationToTheEnd();
      })
  }

  private handleStrangerStatus(event: NostrEvent): void {
    if (event.content === 'typing') {
      this.strangerIsTyping = true;
      this.scrollConversationToTheEnd();
    } else if (event.content === 'disconnected') {
      this.strangerIsTyping = false;
      this.whoDisconnected = MessageAuthor.STRANGER;
      this.currentState = ChatState.DISCONNECTED;
      this.endSession();
    } else {
      this.strangerIsTyping = false;
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
        const typingPromise = this.talkToStrangerParody.isTyping();
        const messagePromise = this.talkToStrangerParody.sendMessage(stranger, message);
        await Promise.all([typingPromise, messagePromise]);
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
      this.talkToStrangerParody.isTyping();
    }

    clearTimeout(this.typingTimeoutId);
    this.typingTimeoutId = Number(setTimeout(() => {
      this.talkToStrangerParody.stopTyping();
      this.typingTimeoutId = 0;
    }, this.typingTimeoutAmount));
  }
}
