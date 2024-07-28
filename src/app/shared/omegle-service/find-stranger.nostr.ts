import { Injectable } from '@angular/core';
import { NostrService } from '@belomonte/nostr-ngx';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { Event } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class FindStrangerNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  listenUserStatusUpdate(pubkey: string): Observable<Event> {
    return this.nostrService.observable([
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
    return this.nostrService.observable([
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
