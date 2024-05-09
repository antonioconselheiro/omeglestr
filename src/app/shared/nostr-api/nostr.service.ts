import { Injectable } from '@angular/core';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { Observable, Subject } from 'rxjs';
import { defaultRelays } from '../../default-relays.const';

@Injectable()
export class NostrService {

  private static instance: NostrService | null = null;

  constructor() {
    if (!NostrService.instance) {
      NostrService.instance = this;
    }

    return NostrService.instance;
  }

  request(filters: Filter[]): Promise<Array<Event>> {
    const pool = new SimplePool();
    const events = new Array<Event>();

    return new Promise(resolve => {
      const poolSubscription = pool.subscribeMany(
        defaultRelays, filters, {
          onevent: event => events.push(event),
          oneose(): void {
            poolSubscription.close();
            resolve(events);
          }
        }
      );
    });
  }

  subscribe(filters: Filter[]): Observable<Event> {
    const pool = new SimplePool();
    const subject = new Subject<Event>();
    const onDestroy$ = new Subject<void>();
    const poolSubscription = pool.subscribeMany(
      defaultRelays, filters, {
        onevent: event => subject.next(event),
        oneose(): void { }
      }
    );

    onDestroy$.subscribe(() => {
      poolSubscription.close();
      onDestroy$.unsubscribe();
    });

    return subject.asObservable();
  }

  async publish(event: Event): Promise<void> {
    return Promise.all(
      new SimplePool().publish(defaultRelays, event)
    ).then(() => Promise.resolve());
  }
}
