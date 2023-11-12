import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { Event, nip19 } from 'nostr-tools';

@Injectable()
export class OmegleConverter {

  constructor() { }

  getAuthorFromEvent(event: Event): NostrUser {
    return new NostrUser(nip19.npubEncode(event.pubkey));
    
  }
}
