import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event, nip19 } from 'nostr-tools';
import { NostrService } from '@shared/nostr-api/nostr.service';
import { OmegleNostr } from './omegle.nostr';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrUser } from '@domain/nostr-user';

@Injectable()
export class OmegleProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private omegleNostr: OmegleNostr,
    private nostrService: NostrService
  ) {}

  publish<T extends number>(event: Event<T>): Promise<void> {
    return this.nostrService.publish(event);
  }

  async searchStranger(user: Required<NostrUser>): Promise<NostrUser> {
    try {
      const strangeStatus = await this.omegleNostr.findByStatus();
      if (strangeStatus.length) {
        this.inviteRandomToChating(user, strangeStatus);
        //  depois disso precisarei escutar o status da
        //  confirmação de conexão do chat
      } else {
        this.publishWannaChatStatus(user);
      }
    } finally {
      this.publishWannaChatStatus(user);
    }
  }

  private inviteRandomToChating(user: Required<NostrUser>, strangeStatus: Event[]): Promise<void> {
    const random = Math.floor(Math.random() * strangeStatus.length);
    const stranger = new NostrUser(nip19.npubEncode(strangeStatus[random].pubkey));
    return this.publishChatInviteStatus(user, stranger);
  }

  listenWannaChatStatus(): Promise<NostrUser> {
    //  write a listening to a reply for wanna chat status published
    //  include one minute timeout (one minute based in the event
    //  expiration time, maybe should try to centralize this config)
  }

  private publishWannaChatStatus(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  private publishChatInviteStatus(user: Required<NostrUser>, stranger: NostrUser): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createChatingUserStatus(user, stranger);
    return this.nostrService.publish(wannaChatStatus);
  }

  async sendMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<void> {
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.nostrService.publish(event);
  }

  // shows strange new messages and confirm your message was send
  listenMessages(): Observable<[]> {

  }

  isTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  stopTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  disconnect(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createDisconnectedUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }
}
