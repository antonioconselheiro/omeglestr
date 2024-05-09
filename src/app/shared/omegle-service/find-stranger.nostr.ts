import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { Event } from 'nostr-tools';
import { Observable } from 'rxjs';
import { NostrService } from '../nostr-api/nostr.service';

@Injectable()
export class FindStrangerNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  getUserStatusUpdate(pubkey: string): Observable<Event> {
    const currentTimeInSeconds = (new Date().getTime() / 1_000) - 5;
    return this.nostrService.subscribe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'omegle' ],
        authors: [ pubkey ],
        since: currentTimeInSeconds
      }
    ]);
  }

  getUpdatedProfileStatus(npubkey: string): Promise<Event[]> {
    console.info('[api] listen updated profile status, npubkey: ', npubkey);
    console.info('[request]', [
      {
        authors: [npubkey],
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        limit: 1
      }
    ]);
    return this.nostrService.request([
      {
        authors: [npubkey],
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        limit: 1
      }
    ]);
  }

  listenChatAvailable(user: Required<NostrUser>): Observable<Event> {
    const currentTimeInSeconds = (new Date().getTime() / 1_000) - 5;
    const oneHourInSeconds = (60 * 60);
    return this.nostrService.subscribe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'wannachat', 'omegle' ],
        since: currentTimeInSeconds - oneHourInSeconds
      },

      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.publicKeyHex ],
        since: currentTimeInSeconds
      }
    ]);
  }
}
