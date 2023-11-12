import { Injectable } from '@angular/core';
import { Event, Filter, SimplePool, validateEvent, verifySignature } from 'nostr-tools';
import { defaultRelays } from '../../default-relays.const';

@Injectable()
export class NostrService {

  private static instance: NostrService | null = null;

  pool = new SimplePool();

  constructor() {
    if (!NostrService.instance) {
      NostrService.instance = this;
    }

    return NostrService.instance;
  }
  
  get<K extends number>(filters: Filter<K>[]): Promise<Array<Event<K>>> {
    const events = new Array<Event<K>>();
    const sub = this.pool.sub(
      defaultRelays, filters
    );

    sub.on('event', event => {
      events.push(event);
    });

    return new Promise(resolve => {
      sub.on('eose', () => {
        resolve(events);
      });
    });
  }

  async publish<K extends number>(event: Event<K>): Promise<void> {
    const ok = validateEvent(event);
    const veryOk = verifySignature(event);

    if (!ok || !veryOk) {
      console.error(' :: event is not valid... aborting...');
      return Promise.resolve();
    }

    await this.pool.publish(defaultRelays, event);

    return Promise.resolve();
  }
}
