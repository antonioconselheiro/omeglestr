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
    console.info('observing filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'omegle' ],
        authors: [ pubkey ]
      }
    ]);
    return this.mainPool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'omegle' ],
        authors: [ pubkey ]
      }
    ]);
  }

  queryWannachatResponse(user: Required<NostrUser>): Promise<NostrEvent[]> {
    console.info('quering filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
    return this.mainPool.query([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
  }

  listenWannachatResponse(user: Required<NostrUser>): Observable<NostrEvent> {
    console.info('observing filter:', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
    return this.mainPool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'chating', 'omegle' ],
        '#p': [ user.pubkey ],
        limit: 1
      }
    ]);
  }

  async queryChatAvailable(): Promise<NostrEvent | null> {
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1_000);
    const timeInSeconds = (60 * 10);

    console.info('quering filter: ', [
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'wannachat', 'omegle' ],
        limit: 1,
        since: currentTimeInSeconds - timeInSeconds
      }
    ]);
    const [wannachat] = await this.mainPool.query([
      {
        kinds: [ kinds.UserStatuses ],
        '#t': [ 'wannachat', 'omegle' ],
        limit: 1,
        since: currentTimeInSeconds - timeInSeconds
      }
    ]);

    if (wannachat) {
      console.info('wanna chat found:', wannachat);
    } else {
      console.info('wanna chat NOT found...');
    }
    return Promise.resolve(wannachat || null);
  }
}
