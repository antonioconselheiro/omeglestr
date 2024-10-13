import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IgnoreListService {

  private pubkeySet = new Set<string>();

  constructor() {
    this.loadList();
  }
  
  private loadList() {
    try {
      const serialized = sessionStorage.getItem('alwaysIgnoreWannachat');
      if (serialized) {
        let ignoreList = JSON.parse(serialized);
        if (ignoreList instanceof Array) {
          this.pubkeySet = new Set(ignoreList);
        } else {
          sessionStorage.setItem('alwaysIgnoreWannachat', '[]');
        }
      }
    } catch {
      sessionStorage.setItem('alwaysIgnoreWannachat', '[]');
    }
  }

  saveInList(pubkey: string): void {
    this.pubkeySet.add(pubkey);
    sessionStorage.setItem('alwaysIgnoreWannachat', JSON.stringify([...this.pubkeySet]));
  }

  isInList(pubkey: string): boolean {
    return this.pubkeySet.has(pubkey);
  }
}
