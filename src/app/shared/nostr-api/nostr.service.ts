import { Injectable } from '@angular/core';
import { defaultRelays } from '../../default-relays.const';
import { Filter, Event, SimplePool } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class NostrService {
  private readonly relays = defaultRelays;

  get<K extends number>(filters: Filter<K>[]): Promise<Array<Event<K>>> {
    const pool = new SimplePool();
    const events = new Array<Event<K>>();
    const sub = pool.sub(
      this.relays, filters
    );

    sub.on('event', event => {
      events.push(event);
    });

    return new Promise(resolve => {
      sub.on('eose', () => {
        resolve(events);
        sub.unsub();
        pool.close(this.relays);
      });
    });
  }
}
