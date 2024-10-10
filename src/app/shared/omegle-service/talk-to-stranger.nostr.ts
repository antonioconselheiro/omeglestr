import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { MainNPool } from '@shared/nostr/main.npool';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { kinds, nip04, NostrEvent } from 'nostr-tools';
import { finalize, Observable, Subject } from 'rxjs';

@Injectable()
export class TalkToStrangerNostr {

  readonly UPDATE_COUNT_TIMEOUT = 1000 * 10;

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private mainPool: MainNPool
  ) { }

  async openEncryptedDirectMessage(you: Required<NostrUser>, stranger: NostrUser, event: NostrEvent): Promise<string> {
    return nip04.decrypt(you.secretKey, stranger.pubkey, event.content);
  }

  listenMessages(me: Required<NostrUser>, stranger: NostrUser): Observable<NostrEvent> {
    return this.mainPool.observe([
      {
        kinds: [ kinds.EncryptedDirectMessage ],
        authors: [ stranger.pubkey ],
        '#p': [ me.pubkey ]
      }
    ]);
  }

  listenStrangerStatus(stranger: NostrUser): Observable<NostrEvent> {
    return this.mainPool.observe([
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
      console.info('user count requested');
      this.mainPool.count([
        {
          kinds: [ kinds.UserStatuses ],
          '#t': [ 'omegle' ]
        }
      ])
      .then(count => {
        console.info('active users counted: ', count);
        subject.next(count.count);
        requestPending = false;
      })
      .catch(e => {
        console.error('user count lauched error', e);
        requestPending = false;
      });
    };

    const id = setInterval(closure, this.UPDATE_COUNT_TIMEOUT);
    closure();

    return subject
      .asObservable()
      .pipe(finalize(() => clearInterval(id)));
  }

  async sendMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<void> {
    await this.stopTyping(you);
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.mainPool.event(event);
  }

  isTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.mainPool.event(wannaChatStatus);
  }

  stopTyping(you: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(you);
    return this.mainPool.event(wannaChatStatus);
  }
}
