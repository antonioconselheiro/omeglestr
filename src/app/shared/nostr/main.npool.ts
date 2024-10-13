import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { finalize, Observable, Subject } from 'rxjs';

export class NPoolService extends NPool {

  constructor() {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: async (filters) => {
        const toupleList: Array<[string, NostrFilter[]]> = [];
        import.meta.env.NG_APP_RELAYS.split(',').forEach(relay => {
          toupleList.push([relay, filters]);
        });

        return new Map(toupleList);
      },
      eventRouter: async () => import.meta.env.NG_APP_RELAYS.split(',')
    });
  }

  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    console.info(new Date().toLocaleString(),'[[subscribe filter]]', filters);
    const abort = new AbortController();
    const subject = new Subject<NostrEvent>();

    (async () => {
      for await (const msg of this.req(filters, abort)) {
        if (msg[0] === 'CLOSED') {
          subject.error(msg);
          break;
        } else if (msg[0] === 'EVENT') {
          subject.next(msg[2]);
        }
      }
    })();
  
    return subject
      .asObservable()
      .pipe(
        finalize(() => {
          console.info(new Date().toLocaleString(),'[[unsubscribe filter]]', filters);
          abort.abort();
        })
      );
  }
}
