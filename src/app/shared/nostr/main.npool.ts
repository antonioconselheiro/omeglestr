import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';

export class MainNPool extends NPool {

  constructor() {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: async (filters) => new Map([['ws://umbrel.local:4848', filters]]),
      eventRouter: async () => ['ws://umbrel.local:4848']
    });
  }
 
  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    console.info('[[subscribe filter]] ', filters);
    const observable = from(this.req(filters));
    const closedSignal$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED'),
      takeUntil(of(undefined)) 
    );

    closedSignal$.subscribe({ next: () => console.info('[[unsubscribe filter]] ', filters) });
  
    const obs = observable
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(closedSignal$)
      ).pipe(map(([,,event]) => event as NostrEvent));
    obs.subscribe(event => console.info('[[filter found event]]', event, filters));
    return obs;
  }
}
