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
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1_000) - 20;
    const timeInSeconds = (60 * 10);
    return this.mainPool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'wannachat', 'omegle' ],
        since: currentTimeInSeconds - timeInSeconds
      },

      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
       // since: currentTimeInSeconds
      }
    ]);
  }
}
