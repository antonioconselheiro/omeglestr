import { Injectable } from '@angular/core';
import { OmeglestrUser } from '@domain/omeglestr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { GlobalConfigService } from '@shared/global-config/global-config.service';
import { EventTemplate, finalizeEvent, kinds, nip04 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrEventFactory {

  readonly largeExpirationTime = 30 * 60;

  constructor(
    private readonly globalConfigService: GlobalConfigService
  ) { }

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }

  /**
   * @param expireIn time in seconds to expire, default to 10
   * @returns expiration timestamp
   */
  private getExpirationTimestamp(
    expireIn = this.globalConfigService.wannachatStatusDefaultTimeoutInSeconds
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
  async createEncryptedDirectMessage(you: Required<OmeglestrUser>, stranger: OmeglestrUser, message: string): Promise<NostrEvent> {
    const encriptedMessage = await nip04.encrypt(you.secretKey, stranger.pubkey, message);

    const unsignedEvent: EventTemplate = {
      kind: kinds.EncryptedDirectMessage,
      content: encriptedMessage,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags: [
        [ 'p', stranger.pubkey],
        [ 'expiration', this.getExpirationTimestamp(this.largeExpirationTime) ]
      ]
    };

    const verifiedEvent = finalizeEvent(
      unsignedEvent, you.secretKey
    );

    return Promise.resolve(verifiedEvent);
  }

  /**
   * NIP 38
   * https://github.com/nostr-protocol/nips/blob/master/38.md
   */
  createWannaChatUserStatus(user: Required<OmeglestrUser>): NostrEvent {
    return this.createUserStatus(user, 'wannachat', [
        [ 'expiration', this.getExpirationTimestamp() ],
        [ 't', 'wannachat']
      ]);
  }

  createDisconnectedUserStatus(user: Required<OmeglestrUser>): NostrEvent {
    return this.createUserStatus(user, 'disconnected', [
      [ 'expiration', this.getExpirationTimestamp() ]
    ]);
  }

  createTypingUserStatus(user: Required<OmeglestrUser>): NostrEvent {
    return this.createUserStatus(user, 'typing', [
      [ 'expiration', this.getExpirationTimestamp(this.largeExpirationTime) ]
    ]);
  }

  createChatingUserStatus(you: Required<OmeglestrUser>, strange: OmeglestrUser): NostrEvent {
    return this.createUserStatus(you, 'chating', [
      [ 'expiration', this.getExpirationTimestamp(this.largeExpirationTime) ],
      [ 'p', strange.pubkey ],
      [ 't', 'chating' ]
    ]);
  }

  deleteUserHistory(you: Required<OmeglestrUser>): NostrEvent {
    const template: EventTemplate = {
      kind: 5,
      tags: [
        [ 'k', String(kinds.EncryptedDirectMessage) ],
        [ 'k', String(kinds.UserStatuses) ],
        [ 'expiration', this.getExpirationTimestamp() ]
      ],
      created_at: Math.floor(new Date().getTime() / 1000),
      content: ''
    }

    const verifiedEvent = finalizeEvent(
      template, you.secretKey
    );

    return verifiedEvent;
  }

  cleanUserStatus(user: Required<OmeglestrUser>): NostrEvent {
    return this.createUserStatus(user, '');
  }

  private createUserStatus(user: Required<OmeglestrUser>, status: string, customTags?: string[][]): NostrEvent {
    const tags = [
      ['d', 'general'],
      ['t', 'omegle'],
      ...(customTags || [])
    ];

    const eventTemplate: EventTemplate = {
      kind: kinds.UserStatuses,
      content: status,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags
    };

    return finalizeEvent(
      eventTemplate, user.secretKey
    );
  }
}
