import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { UnsignedEvent, getEventHash, getSignature, nip04 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrEventFactory {

  /**
   * default expiration time in seconds
   */
  private readonly DEFAULT_EXPIRATION_TIME = 60;

  private getCurrentTimestamp(): number {
    const oneMillisecond = 1000;
    return Math.floor(Date.now() / oneMillisecond);
  }

  /**
   * @param expireIn time in seconds to expire, default to 60
   * @returns expiration timestamp
   */
  private getExpirationTimestamp(expireIn = this.DEFAULT_EXPIRATION_TIME): string {
    const oneMillisecond = 1000;
    const expirationTimestamp = Math.floor(Date.now() / oneMillisecond) + expireIn;
    return String(expirationTimestamp);
  }

  /**
   * NIP 4
   * https://github.com/nostr-protocol/nips/blob/master/04.md
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
      pubkey: user.publicKeyHex,
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
