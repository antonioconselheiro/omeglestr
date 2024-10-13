import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IgnoreListService {

  private list: string[] = [];

  constructor() {
    this.loadList();
  }
  
  private loadList() {
    try {
      const serialized = sessionStorage.getItem('alwaysIgnoreWannachat');
      if (serialized) {
        let ignoreList = JSON.parse(serialized);
        if (ignoreList instanceof Array) {
          this.list = [];
        } else {
          sessionStorage.setItem('alwaysIgnoreWannachat', '[]');
        }
      }
    } catch {
      sessionStorage.setItem('alwaysIgnoreWannachat', '[]');
    }
  }

  saveInList(pubkey: string): void {
    this.list.push(pubkey);
    sessionStorage.setItem('alwaysIgnoreWannachat', JSON.stringify(this.list));
  }

  isInList(pubkey: string): boolean {
    return this.list.includes(pubkey);
  }
}
