import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { NostrService } from '../nostr-api/nostr.service';
import { Observable } from 'rxjs';

@Injectable()
export class OmegleNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  findByStatus(): Promise<NDKEvent[]> {
    return this.nostrService.request([
      {
        kinds: [ +NostrEventKind.UserStatuses ],
        '#t': [ 'wannachat' ]
      }
    ]);
  }

  getProfileStatus(npubkey: string[]): Promise<NDKEvent[]> {
    return this.nostrService.request([
      {
        kinds: [ +NostrEventKind.UserStatuses ],
        authors: npubkey
      }
    ]);
  }

  listenDirectMessage(fromNostrPublic: string): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        kinds: [ +NostrEventKind.EncryptedDirectMessage ],
        authors: [ fromNostrPublic ]
      }
    ]);
  }

  listenChatInvite(author: string): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        kinds: [ +NostrEventKind.EncryptedDirectMessage ],
        '#p': [ author ]
      }
    ]);
  }
}
