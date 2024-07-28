import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrService } from '@belomonte/nostr-ngx';
import { Event, nip04 } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class TalkToStrangerProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private nostrService: NostrService
  ) { }

  async openEncryptedDirectMessage(you: Required<NostrUser>, stranger: NostrUser, event: Event): Promise<string> {
    return nip04.decrypt(you.nostrSecret, stranger.nostrPublic, event.content);
  }

  listenMessages(me: Required<NostrUser>, stranger: NostrUser): Observable<Event> {
    return this.nostrService.observable([
      {
        kinds: [ Number(NostrEventKind.EncryptedDirectMessage) ],
        authors: [ stranger.publicKeyHex ],
        '#p': [ me.publicKeyHex ]
      }
    ]);
  }

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
