import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { MainNPool } from '@shared/nostr/main.npool';
import { Event } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class FindStrangerNostr {

  constructor(
    private mainPool: MainNPool
  ) { }

  listenUserStatusUpdate(pubkey: string): Observable<Event> {
    return this.mainPool.observe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'omegle' ],
        authors: [ pubkey ]
      }
    ]);
  }

  listenChatAvailable(user: Required<NostrUser>): Observable<Event> {
    const currentTimeInSeconds = (new Date().getTime() / 1_000) - 5;
    const oneHourInSeconds = (60 * 60);
    return this.mainPool.observe([
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
