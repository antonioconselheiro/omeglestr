import { Injectable } from '@angular/core';
import { NostrFilter, NPoolOpts, NRelay1 } from '@nostrify/nostrify';
import { RelayConfigService } from '@shared/relay-config/relay-config.service';

@Injectable()
export class OmegleNPoolOpts implements NPoolOpts<NRelay1> {

  constructor(
    private relayConfigService: RelayConfigService
  ) { }
  
  open(url: string): NRelay1 {
    return new NRelay1(url);
  }

  async reqRouter(filters: NostrFilter[]): Promise<Map<string, NostrFilter[]>> {
    const toupleList: Array<[string, NostrFilter[]]> = [];
    this.relayConfigService.getConfig().forEach(relay => {
      toupleList.push([relay, filters]);
    });

    return new Map(toupleList);
  }

  async eventRouter(): Promise<string[]> {
    return this.relayConfigService.getConfig();
  }

}
