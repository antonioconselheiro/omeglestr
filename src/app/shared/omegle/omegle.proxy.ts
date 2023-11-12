import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class OmegleProxyService {

  searchStranger(): Observable<void> {

  }

  sendMessage(): void {

  }

  // shows strange new messages and confirm your message was send
  listenMessages(): Observable<[]> {

  }

  isTyping(): void {
    //  apply userstatuses, 'typing'
  }

  stopTyping(): void {
    //  clean userstatuses
  }

  disconnect(): void {

  }
}
