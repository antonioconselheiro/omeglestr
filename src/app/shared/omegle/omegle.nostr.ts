import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { Event } from 'nostr-tools';
import { NostrService } from '../nostr-api/nostr.service';

@Injectable()
export class OmegleNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  findByStatus(): Promise<Event<NostrEventKind.UserStatuses>[]> {
    return this.nostrService.get([
      {
        kinds: [ NostrEventKind.UserStatuses ],
        '#t': [ 'wannachat' ]
      }
    ]);
  }

  listenDirectMessage() {

  }
}
