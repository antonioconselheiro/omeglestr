import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { NostrService } from '../nostr-api/nostr.service';
import { Observable } from 'rxjs';
import { GlobalConfigService } from '@shared/global-config/global-config.service';
import { NostrUser } from '@domain/nostr-user';

@Injectable()
export class OmegleNostr {

  constructor(
    private readonly config: GlobalConfigService,
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

  getRecentOmegleStatus(): Promise<NDKEvent[]> {
    const recent = (new Date().getTime() / 1_000) - this.config.WANNACHAT_STATUS_DEFAULT_TIMEOUT_IN_MS;
    return this.nostrService.request([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'omegle' ],
        since: recent
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

  listenChatingResponse(user: Required<NostrUser>): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'chating' ],
        '#p': [ user.publicKeyHex ],
        since: (new Date().getTime() / 1_000) - 5
      }
    ]);
  }

  listenNewWannaChatStatus(): Observable<NDKEvent> {
    return this.nostrService.subscribe([
      {
        kinds: [ Number(NostrEventKind.UserStatuses) ],
        '#t': [ 'wannachat' ],
        since: (new Date().getTime() / 1_000)
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
