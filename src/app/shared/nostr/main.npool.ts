import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { filter, finalize, from, map, Observable, takeUntil } from 'rxjs';

export class MainNPool extends NPool {

  constructor() {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: async (filters) => new Map([['ws://umbrel.local:4848', filters]]),
      eventRouter: async () => ['ws://umbrel.local:4848']
    });
  }

  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    console.info('[[subscribe filter]]', filters);
    const abort = new AbortController();
    const observable = from(this.req(filters, abort));
    const relayClosed$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED')
    );

    observable.subscribe({
      next: event => {
        console.debug('[DEBUG] something found by filters:', filters, 'event:', event);
      },
      error: error => {
        console.debug('[DEBUG] ERROR received from filters:', filters, 'error:', error);
      },
      complete: () => {
        console.debug('[DEBUG] Filter completed:', filters);
      }
    });

    relayClosed$.subscribe(() => {
      console.info('[[unsubscribe filter]]', filters);
      abort.abort();
    });
  
    return observable
      .pipe(
        finalize(() => {
          console.info('[[unsubscribe filter]]', filters);
          abort.abort();
        })
      )
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(relayClosed$),
      ).pipe(map(([,,event]) => {
        console.info('[[filter found event]]', event, filters)
        return event as NostrEvent;
      }));
  }
}
