import { Injectable } from '@angular/core';
import { NostrService } from '../nostr-api/nostr.service';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';

@Injectable()
export class OmegleNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  findByStatus() {
    this.nostrService.get([
      {
        kinds: [ NostrEventKind.UserStatuses ],
        '#t': [ 'wannachat' ]
      }
    ]);
  }

  updateUserStatus() {

  }

  listenDirectMessage() {

  }

  sendDirectMessage() {

  }

  deleteAccount() {

  }
}
