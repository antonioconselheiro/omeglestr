import { Injectable } from '@angular/core';
import { NostrEvent, NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { RelayConfigService } from '@shared/relay-config/relay-config.service';
import { finalize, Observable, Subject } from 'rxjs';

@Injectable()
export class NPoolService extends NPool<NRelay1> {

  constructor(
    private relayConfigService: RelayConfigService
  ) {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: async (filters) => {
        const toupleList: Array<[string, NostrFilter[]]> = [];
        this.relayConfigService.getConfig().forEach(relay => {
          toupleList.push([relay, filters]);
        });

        return new Map(toupleList);
      },
      eventRouter: async () => this.relayConfigService.getConfig()
    });
  }

  observe(filters: Array<NostrFilter>, opts?: {
    signal?: AbortSignal;
  }): Observable<NostrEvent> {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']','[[subscribe filter]]', filters);
    const controller = new AbortController();
    const signal = opts?.signal ? AbortSignal.any([opts.signal, controller.signal]) : controller.signal;
    const subject = new Subject<NostrEvent>();
    const nset = new Map<string, NostrEvent>();

    (async () => {
      for await (const msg of this.req(filters, { signal })) {
        if (msg[0] === 'CLOSED') {
          subject.error(msg);
          break;
        } else if (msg[0] === 'EVENT') {
          const nsetSize = nset.size;
          nset.set(msg[2].id, msg[2]);

          if (nsetSize !== nset.size) {
            subject.next(msg[2]);
          } else {
            console.debug(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'event deduplicated, not emiting again: ', msg[2]);
            console.debug(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'current nset from request: ', nset);
          }
        }
      }
    })();
  
    return subject
      .asObservable()
      .pipe(
        finalize(() => {
          console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', '[[unsubscribe filter]]', filters);
          controller.abort();
        })
      );
  }
}
