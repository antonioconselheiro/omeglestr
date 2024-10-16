import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  saveConfig(relays: string[], place: 'session' | 'local'): void {
    if (place === 'session') {
      sessionStorage.setItem('omeglestr', JSON.stringify({ relays }));
    } else if (place === 'local') {
      localStorage.setItem('omeglestr', JSON.stringify({ relays }));
    }
  }

  getConfig(): string[] {
    const sessionConfig = localStorage.getItem('omeglestr');
    try {
      if (sessionConfig) {
        return JSON.parse(sessionConfig);
      }
    } catch { }

    const localConfig = localStorage.getItem('omeglestr');
    try {
      if (localConfig) {
        return JSON.parse(localConfig);
      }
    } catch { }

    return import.meta.env.NG_APP_RELAYS.split(',');
  }
}
