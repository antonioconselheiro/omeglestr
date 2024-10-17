import { Injectable } from '@angular/core';
import { normalizeURL } from 'nostr-tools/utils';

@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  saveConfig(relays: string[]): void {
    localStorage.setItem('omeglestr', JSON.stringify({ relays }));
  }

  getConfig(): string[] {
    const localConfig = localStorage.getItem('omeglestr');
    try {
      if (localConfig) {
        return JSON.parse(localConfig).relays.map(normalizeURL);
      }
    } catch { }

    return import.meta.env.NG_APP_RELAYS.split(',').map(normalizeURL);
  }
}
