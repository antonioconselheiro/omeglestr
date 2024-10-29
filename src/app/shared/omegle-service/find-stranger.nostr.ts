import { Injectable } from '@angular/core';
import { NpoolOpts } from '@domain/npool-opts.interface';
import { OmeglestrUser } from '@domain/omeglestr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { IgnoreListService } from '@shared/ignore-list/ignore-list.service';
import { NPoolService } from '@shared/nostr/main.npool';
import { kinds } from 'nostr-tools';
import { Observable } from 'rxjs';

@Injectable()
export class FindStrangerNostr {

  constructor(
    private npool: NPoolService,
    private ignoreListService: IgnoreListService
  ) { }

  listenUserStatusUpdate(pubkey: string, opts: NpoolOpts): Observable<NostrEvent> {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'observing filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        authors: [ pubkey ]
      }
    ]);
    return this.npool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        authors: [ pubkey ]
      }
    ], opts);
  }

  queryWannachatResponse(user: Required<OmeglestrUser>, opts: NpoolOpts): Promise<NostrEvent[]> {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']','quering filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
    return this.npool.query([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ], opts);
  }

  listenWannachatResponse(user: Required<OmeglestrUser>, opts: NpoolOpts): Observable<NostrEvent> {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']','observing filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
    return this.npool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ], opts);
  }

  async queryChatAvailable(opts: NpoolOpts): Promise<NostrEvent | null> {
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1_000);
    const timeInSeconds = (60 * 10);

    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'quering filter: ', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'wannachat', 'omegle' ],
        since: currentTimeInSeconds - timeInSeconds
      }
    ]);
    let wannachats = await this.npool.query([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'wannachat', 'omegle' ],
        since: currentTimeInSeconds - timeInSeconds
      }
    ], opts);

    wannachats = wannachats.filter(wannachat => !this.ignoreListService.isInList(wannachat.pubkey));
    const wannachat = wannachats[Math.floor(Math.random() * wannachats.length)];

    if (wannachat) {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']','wanna chat found:', wannachat);
    } else {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']','wanna chat NOT found...');
    }

    return Promise.resolve(wannachat || null);
  }
}
