import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ModalService } from '@belomonte/async-modal-ngx';
import { FindStrangerParody, log, NostrPublicUser, TalkToStrangerParody } from '@belomonte/ngx-parody-api';
import { ChatMessage } from '@domain/chat-message.interface';
import { MessageAuthor } from '@domain/message-author.enum';
import { NostrEvent } from '@nostrify/nostrify';
import { GlobalErrorHandler } from '@shared/error-handling/global.error-handler';
import { RelayConfigComponent } from '@shared/relay-config/relay-config.component';
import { SoundNotificationService } from '@shared/sound/sound-notification.service';
import { Subscription } from 'rxjs';
import { ChatState } from './chat-state.enum';

@Component({
  selector: 'omg-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnDestroy {

  readonly stateConnected = ChatState.CONNECTED;
  readonly stateUpToDisconnect = ChatState.UP_TO_DISCONNECT;
  readonly stateDisconnected = ChatState.DISCONNECTED;
  readonly stateSearchingStranger = ChatState.SEARCHING_STRANGER;

  readonly authorStranger = MessageAuthor.STRANGER;
  readonly authorYou = MessageAuthor.YOU;

  @ViewChild('conversation')
  conversationEl!: ElementRef;

  @ViewChild('messageField')
  messageFieldEl!: ElementRef;

  strangerIsTyping = false;
  currentState = ChatState.DISCONNECTED;
  whoDisconnected: MessageAuthor | null = null;

  stranger: NostrPublicUser | null = null;

  messages: Array<[ChatMessage, string | null]> = [];

  controller: AbortController | null = null;

  private subscriptions = new Subscription();

  constructor(
    private globalErrorHandler: GlobalErrorHandler,
    private findStrangerParody: FindStrangerParody,
    private talkToStrangerParody: TalkToStrangerParody,
    private soundNotificationService: SoundNotificationService,
    private modalService: ModalService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:beforeunload')
  async onBeforeUnload(): Promise<true> {
    await this.endSession(null);
    return true;
  }

  configRelays(): void {
    this.modalService
      .createModal(RelayConfigComponent)
      .build();
  }

  findStranger(): void {
    this.cleanMessageField(this.messageFieldEl.nativeElement);
    if (this.controller) {
      return;
    }

    this.whoDisconnected = null;
    this.controller = new AbortController();
    this.currentState = this.stateSearchingStranger;
    this.messages = [];

    this.findStrangerParody
      .searchStranger({
        signal: this.controller.signal,
        searchFor: 'omegle',
        userIs: 'omegle'
      })
      .then(stranger => this.startConversation(stranger));
  }

  clearSession(disconnector: MessageAuthor | null): void {
    this.currentState = ChatState.DISCONNECTED;
    this.strangerIsTyping = false;
    this.whoDisconnected = disconnector;
    this.stranger = null;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.controller = null;
  }

  endSession(disconnector: MessageAuthor | null): Promise<NostrEvent> {
    return this.findStrangerParody
      .endSession()
      .finally(() => this.clearSession(disconnector));
  }

  private startConversation(stranger: NostrPublicUser): void {
    log.debug('starting conversation, stranger: ', stranger);
    this.stranger = stranger;
    this.currentState = ChatState.CONNECTED;

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
      //  FIXME: devo trocar o scroll to the end para o scroll de alguns pixels abaixo,
      //  evitando reset do scroll em caso do usuário realmente estar voltando a conversa
      this.scrollConversationToTheEnd();
    } else if (event.content === 'disconnected') {
      this.strangerIsTyping = false;
      this.currentState = ChatState.DISCONNECTED;
      this.endSession(MessageAuthor.STRANGER);
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
        const typingPromise = this.talkToStrangerParody.stopTyping();
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
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.endSession(null);
  }
}
