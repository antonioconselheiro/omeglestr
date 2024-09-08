import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { MainNPool } from '@shared/nostr/main.npool';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { nip04, NostrEvent } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class TalkToStrangerProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private mainPool: MainNPool
  ) { }

  async openEncryptedDirectMessage(you: Required<NostrUser>, stranger: NostrUser, event: NostrEvent): Promise<string> {
    return nip04.decrypt(you.nostrSecret, stranger.nostrPublic, event.content);
  }

  listenMessages(me: Required<NostrUser>, stranger: NostrUser): Observable<NostrEvent> {
    return this.mainPool.observe([
      {
        kinds: [ Number(NostrEventKind.EncryptedDirectMessage) ],
        authors: [ stranger.publicKeyHex ],
        '#p': [ me.publicKeyHex ]
      }
    ]);
  }

  async sendMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<void> {
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.mainPool.event(event);
  }

  isTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.mainPool.event(wannaChatStatus);
  }

  stopTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(user);
    return this.mainPool.event(wannaChatStatus);
  }
}
