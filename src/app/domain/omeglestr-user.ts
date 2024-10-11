import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

export class OmeglestrUser {

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

  static fromPubkey(pubkey: string): OmeglestrUser {
    return new OmeglestrUser(nip19.npubEncode(pubkey));
  }

  static fromNostrSecret(nsec: string): Required<OmeglestrUser> {
    return new OmeglestrUser(nsec) as Required<OmeglestrUser>;
  }

  static fromNostrSecretHex(nsecHex: Uint8Array): Required<OmeglestrUser> {
    return new OmeglestrUser(nip19.nsecEncode(nsecHex)) as Required<OmeglestrUser>;
  }

  static create(): Required<OmeglestrUser> {
    return this.fromNostrSecretHex(generateSecretKey());
  }

  toString(): string {
    return this.pubkey;
  }
}