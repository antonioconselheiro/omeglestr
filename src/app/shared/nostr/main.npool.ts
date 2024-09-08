import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';

export class MainNPool extends NPool {

  constructor() {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: async (filters) => new Map([['wss://umbrel.local:8484', filters]]),
      eventRouter: async () => ['wss://umbrel.local:8484']
    });
  }

    // TODO: cool, I need to centralize it in nostr-ngx  
  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    const observable = from(this.req(filters));
    const closedSignal$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED'),
      takeUntil(of(undefined)) 
    );
  
    return observable
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(closedSignal$)
      ).pipe(map(([,,event]) => event as NostrEvent));
  }
}
