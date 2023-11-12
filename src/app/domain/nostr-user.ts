import { generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools';

export class NostrUser {

  /**
   * nsec
   */
  readonly nostrSecret: string;

  /**
   * npub
   */
  readonly nostrPublic: string;

  /**
   * nsec decoded
   */
  readonly privateKeyHex: string;

  /**
   * npub decoded, famous pubkey
   */
  readonly publicKeyHex: string;

  constructor(
    /**
     * npub or nsec
     */
    nostrString = generatePrivateKey()
  ) {
    const { type, data } = nip19.decode(nostrString);
    if (type === 'nsec') {
      this.nostrSecret = nostrString;
      this.privateKeyHex = data.toString();
      this.publicKeyHex = getPublicKey(this.privateKeyHex);
      this.nostrPublic = nip19.npubEncode(this.publicKeyHex);
    } else {
      throw new Error('Invalid argument, NostrUser expect nsec or npub string');
    }
  }

  toString(): string {
    return this.publicKeyHex;
  }
}
