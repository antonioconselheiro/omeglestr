import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

// FIXME: change this for a signer
export class NostrUser {

  /**
   * nsec
   */
  readonly nsec?: string;

  /**
   * npub
   */
  readonly npub: string;

  /**
   * private key
   */
  readonly secretKey?: Uint8Array;

  /**
   * user pubkey
   */
  readonly pubkey: string;

  constructor(
    /**
     * npub or nsec
     */
    nostrString: string
  ) {
    const { type, data } = nip19.decode(nostrString);
    if (type === 'nsec') {
      this.nsec = nostrString;
      this.secretKey = data;
      this.pubkey = getPublicKey(this.secretKey);
      this.npub = nip19.npubEncode(this.pubkey);
    } else if (type === 'npub') {
      this.npub = nostrString;
      this.pubkey = data.toString();

      this.nsec = undefined;
      this.secretKey = undefined;
    } else {
      throw new Error('Invalid argument, NostrUser expect nsec or npub string');
    }

    let ignoreList = sessionStorage.getItem('alwaysIgnoreWannachat');
    if (!ignoreList) {
      ignoreList = '[]';
    }

    try {
      const updatedIgnoreList = JSON.parse(ignoreList);
      updatedIgnoreList.push(this.pubkey);

      sessionStorage.setItem('alwaysIgnoreWannachat', JSON.stringify(updatedIgnoreList));
    } catch { }
  }

  static fromPubkey(pubkey: string): NostrUser {
    return new NostrUser(nip19.npubEncode(pubkey));
  }

  static fromNostrSecret(nsec: string): Required<NostrUser> {
    return new NostrUser(nsec) as Required<NostrUser>;
  }

  static fromNostrSecretHex(nsecHex: Uint8Array): Required<NostrUser> {
    return new NostrUser(nip19.nsecEncode(nsecHex)) as Required<NostrUser>;
  }

  static create(): Required<NostrUser> {
    return this.fromNostrSecretHex(generateSecretKey());
  }

  toString(): string {
    return this.pubkey;
  }
}