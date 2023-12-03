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

  getProfileStatus(npubkey: string[]): Promise<NDKEvent[]> {
    return this.nostrService.request([
      {
        kinds: [ +NostrEventKind.UserStatuses ],
        authors: npubkey
      }
    ]);
  }

  listenUpdatedProfileStatus(npubkey: string): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        authors: [npubkey],
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        since: Math.floor(new Date().getTime() / 1_000),
        limit: 1
      }
    ]);
  }

  listenGlobalWannaChatStatus(): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'wannachat' ]
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
