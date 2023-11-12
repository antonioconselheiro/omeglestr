import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { Event, UnsignedEvent, getEventHash, getSignature } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrEventFactory {

  constructor() { }

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }

  /**
   * @param expireIn time in seconds to expire, default to 60
   * @returns expiration timestamp
   */
  private getExpirationTimestamp(expireIn = 60): string {
    const oneMillisecond = 1000;
    const expirationTimestamp = Math.floor(Date.now() / oneMillisecond) + expireIn;
    return String(expirationTimestamp);
  }

  /**
   * NIP 4
   */
  createEncryptedDirectMessage() {

  }

  /**
   * NIP 38
   * https://github.com/nostr-protocol/nips/blob/master/38.md
   */
  createUserStatuses(user: NostrUser) {
    const unsignedEvent: UnsignedEvent = {
      kind: NostrEventKind.UserStatuses,
      content: "#wannachat",
      pubkey: user.pubkey,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: this.getCurrentTimestamp(),
      tags: [
        ['d', 'general'],
        ['expiration', this.getExpirationTimestamp()],
        ['t', 'wannachat']
      ]
    };

    const id = getEventHash(unsignedEvent);
    const sig = getSignature(unsignedEvent, user.privateKeyHex);

    return { id, sig, ...unsignedEvent };
  }
}
