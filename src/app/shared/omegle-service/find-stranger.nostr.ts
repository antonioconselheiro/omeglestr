import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { MainNPool } from '@shared/nostr/main.npool';
import { kinds } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class FindStrangerNostr {

  constructor(
    private mainPool: MainNPool
  ) { }

  listenUserStatusUpdate(pubkey: string): Observable<NostrEvent> {
    return this.mainPool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'omegle' ],
        authors: [ pubkey ]
      }
    ]);
  }

  listenChatAvailable(user: Required<NostrUser>): Observable<NostrEvent> {
    const currentTimeInSeconds = (new Date().getTime() / 1_000) - 5;
    const oneHourInSeconds = (60 * 60);
    return this.mainPool.observe([
      {
        kinds: [ Number(kinds.UserStatuses) ],
        '#t': [ 'wannachat', 'omegle' ],
        since: currentTimeInSeconds - oneHourInSeconds
      },

      {
        kinds: [ Number(kinds.UserStatuses) ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.publicKeyHex ],
        since: currentTimeInSeconds
      }
    ]);
  }
}
