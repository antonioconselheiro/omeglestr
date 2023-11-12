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
        const random = Math.floor(Math.random() * strangeStatus.length);
        return new NostrUser(nip19.npubEncode(strangeStatus[random].pubkey))
      } else {
        this.publishWannaChatStatus(user);
      }
    } finally {
      this.publishWannaChatStatus(user);
    }
  }

  private publishWannaChatStatus(user: Required<NostrUser>): void {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    this.nostrService.publish(wannaChatStatus);
  }

  sendMessage(): void {

  }

  // shows strange new messages and confirm your message was send
  listenMessages(): Observable<[]> {

  }

  isTyping(): void {
    //  apply userstatuses, 'typing'
  }

  stopTyping(): void {
    //  clean userstatuses
  }

  disconnect(): void {

  }
}
