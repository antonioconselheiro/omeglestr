import { Injectable } from '@angular/core';
import { OmeglestrUser } from '@domain/omeglestr-user';
import { NPoolService } from '@shared/nostr/main.npool';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { kinds, nip04, NostrEvent } from 'nostr-tools';
import { finalize, Observable, Subject } from 'rxjs';

@Injectable()
export class TalkToStrangerNostr {

  readonly updateUserCountTimeout = 1000 * 60 * 2;

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private npool: NPoolService
  ) { }

  async openEncryptedDirectMessage(you: Required<OmeglestrUser>, stranger: OmeglestrUser, event: NostrEvent): Promise<string> {
    return nip04.decrypt(you.secretKey, stranger.pubkey, event.content);
  }

  listenMessages(me: Required<OmeglestrUser>, stranger: OmeglestrUser): Observable<NostrEvent> {
    return this.npool.observe([
      {
        kinds: [ kinds.EncryptedDirectMessage ],
        authors: [ stranger.pubkey ],
        '#p': [ me.pubkey ]
      }
    ]);
  }

  listenStrangerStatus(stranger: OmeglestrUser): Observable<NostrEvent> {
    return this.npool.observe([
      {
        kinds: [ kinds.UserStatuses ],
        authors: [ stranger.pubkey ]
      }
    ]);
  }

  listenCurrenOnlineUsers(): Observable<number> {
    const subject = new Subject<number>();
    let requestPending = false;
    const closure = () => {
      if (requestPending) {
        return;
      }

      requestPending = true;
      console.info(new Date().toLocaleString(), 'user count requested');
      this.npool.query([
        {
          kinds: [ kinds.UserStatuses ],
          '#t': [ 'omegle' ],
          since: Math.floor(Date.now() / 1000) - (24 * 60 * 60)
        }
      ])
      .then(events => {
        const users = new Set<string>();
        console.info(new Date().toLocaleString(),'count events', events);
        events.forEach(event => users.add(event.pubkey));
        const count = [...users].length;

        console.info(new Date().toLocaleString(), 'active users counted: ', count);
        subject.next(count);
        requestPending = false;
      })
      .catch(e => {
        console.error(new Date().toLocaleString(),'user count lauched error', e);
        requestPending = false;
        clearInterval(id)
      });
    };

    const id = setInterval(closure, this.updateUserCountTimeout);
    closure();

    return subject
      .asObservable()
      .pipe(finalize(() => clearInterval(id)));
  }

  async sendMessage(you: Required<OmeglestrUser>, stranger: OmeglestrUser, message: string): Promise<void> {
    await this.stopTyping(you);
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.npool.event(event);
  }

  isTyping(user: Required<OmeglestrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.npool.event(wannaChatStatus);
  }

  stopTyping(you: Required<OmeglestrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(you);
    return this.npool.event(wannaChatStatus);
  }
}
