import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrService } from '@shared/nostr-api/nostr.service';

@Injectable()
export class TalkToStrangerProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private nostrService: NostrService
  ) { }

  async sendMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<void> {
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.nostrService.publish(event);
  }

  isTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  stopTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }
}
