import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { GlobalConfigService } from '@shared/global-config/global-config.service';
import { Event, UnsignedEvent, getEventHash, getSignature, nip04 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrEventFactory {

  constructor(
    private readonly globalConfigService: GlobalConfigService
  ) {}

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }

  /**
   * @param expireIn time in seconds to expire, default to 60
   * @returns expiration timestamp
   */
  private getExpirationTimestamp(
    expireIn = this.globalConfigService.WANNACHAT_STATUS_DEFAULT_TIMEOUT_IN_MS
  ): string {
    const oneMillisecond = 1000;
    const expirationTimestamp = Math.floor(Date.now() / oneMillisecond) + expireIn;
    return String(expirationTimestamp);
  }

  /**
   * NIP 4
   * https://github.com/nostr-protocol/nips/blob/master/04.md
   * https://github.com/nbd-wtf/nostr-tools/blob/master/nip04.test.ts
   */
  async createEncryptedDirectMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<Event<NostrEventKind.EncryptedDirectMessage>> {
    // TODO: validated encriptedMessage to check if it carry the iv parameter
    const encriptedMessage = await nip04.encrypt(you.nostrSecret, stranger.nostrPublic, message);

    const unsignedEvent = {
      id: '',
      kind: NostrEventKind.EncryptedDirectMessage,
      content: encriptedMessage,
      pubkey: you.publicKeyHex,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags: [
        ['p', stranger.publicKeyHex]
      ]
    };

    unsignedEvent.id = getEventHash(unsignedEvent);
    const sig = getSignature(unsignedEvent, you.privateKeyHex);

    return Promise.resolve({ sig, ...unsignedEvent } as object as Event);
  }

  /**
   * NIP 38
   * https://github.com/nostr-protocol/nips/blob/master/38.md
   */
  createWannaChatUserStatus(user: Required<NostrUser>): Event<NostrEventKind.UserStatuses> {
    return this.createUserStatus(user, 'wannachat', [
        ['d', 'general'],
        ['expiration', this.getExpirationTimestamp()],
        ['t', 'wannachat']
      ]);
  }

  createDisconnectedUserStatus(user: Required<NostrUser>): Event<NostrEventKind.UserStatuses> {
    return this.createUserStatus(user, 'disconnected');
  }

  createTypingUserStatus(user: Required<NostrUser>): Event<NostrEventKind.UserStatuses> {
    return this.createUserStatus(user, 'typing');
  }

  createChatingUserStatus(you: Required<NostrUser>, strange: NostrUser): Event<NostrEventKind.UserStatuses> {
    return this.createUserStatus(you, 'chating', [
      [ 'p', strange.publicKeyHex ]
    ]);
  }

  cleanUserStatus(user: Required<NostrUser>): Event<NostrEventKind.UserStatuses> {
    return this.createUserStatus(user, '');
  }

  private createUserStatus(user: Required<NostrUser>, status: string, tag?: string[][]): Event<NostrEventKind.UserStatuses> {
    let tags = [
      ['d', 'general']
    ];

    tags = tags.concat(tag || []);
    tags.push(['t', 'omegle']);

    const unsignedEvent = {
      id: '',
      kind: NostrEventKind.UserStatuses,
      content: status,
      pubkey: user.publicKeyHex,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags
    };

    unsignedEvent.id = getEventHash(unsignedEvent);
    const sig = getSignature(unsignedEvent, user.privateKeyHex);

    return { sig, ...unsignedEvent } as object as Event;
  }
}
