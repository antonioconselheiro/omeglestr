import { Injectable } from '@angular/core';
import NDK, { NDKEvent, NDKFilter, NDKKind, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import { defaultRelays } from '../../default-relays.const';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Event, UnsignedEvent } from 'nostr-tools';

@Injectable()
export class NostrService {

  private static instance: NostrService | null = null;

  ndk = new NDK({
    explicitRelayUrls: defaultRelays
  });

  constructor() {
    if (!NostrService.instance) {
      NostrService.instance = this;
    }

    return NostrService.instance;
  }

  subscribe(filters: NDKFilter<NDKKind> | NDKFilter<NDKKind>[]): Observable<NDKEvent> {
    const subscription = this.ndk.subscribe(filters, {
      cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST
    });

    const subject = new Subject<NDKEvent>();
    const onDestroy$ = new Subject<void>();
    onDestroy$.subscribe(() => {
      subscription.stop();
      onDestroy$.unsubscribe();
    });
    subject.asObservable().pipe(takeUntil(onDestroy$));
    subscription.eventReceived = event => subject.next(event);

    return subject.asObservable();    
  }
  
  async request(filters: NDKFilter<NDKKind> | NDKFilter<NDKKind>[]): Promise<Array<NDKEvent>> {
    const events = await this.ndk.fetchEvents(filters);
    return Promise.resolve([...events]);
  }

  async publish<T extends number>(event: Event<T>): Promise<void> {
    const ndkEvent = new NDKEvent(this.ndk);
    Object.assign(ndkEvent, event);
    await ndkEvent.publish();
    return Promise.resolve();
  }
}
