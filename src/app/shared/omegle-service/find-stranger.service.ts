import { Injectable } from '@angular/core';
import { OmeglestrUser } from '@domain/omeglestr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { GlobalConfigService } from '@shared/global-config/global-config.service';
import { IgnoreListService } from '@shared/ignore-list/ignore-list.service';
import { NPoolService } from '@shared/nostr/main.npool';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { catchError, Subscription, throwError, timeout } from 'rxjs';
import { FindStrangerNostr } from './find-stranger.nostr';
import { NpoolOpts } from '@domain/npool-opts.interface';

@Injectable()
export class FindStrangerService {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private findStrangerNostr: FindStrangerNostr,
    private ignoreListService: IgnoreListService,
    private config: GlobalConfigService,
    private npool: NPoolService
  ) { }

  publish(event: NostrEvent): Promise<void> {
    return this.npool.event(event);
  }

  async searchStranger(me: Required<OmeglestrUser>, opts: NpoolOpts): Promise<OmeglestrUser> {
    const wannaChat = await this.findStrangerNostr.queryChatAvailable(opts);
    const includePow = true;
    if (wannaChat) {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'inviting ', wannaChat.pubkey, ' to chat and listening confirmation');
      const listening = this.listenChatingConfirmation(wannaChat, me, opts);
      await this.inviteToChating(me, wannaChat, includePow);
      const isChatingConfirmation = await listening;
      this.ignoreListService.saveInList(wannaChat.pubkey);

      if (isChatingConfirmation) {
        return Promise.resolve(OmeglestrUser.fromPubkey(wannaChat.pubkey));
      } else {
        await this.disconnect(me);
        return this.searchStranger(me, opts);
      }
    }

    await this.publishWannaChatStatus(me, includePow);
    return new Promise(resolve => {
      const sub = this.findStrangerNostr
        .listenWannachatResponse(me, opts)
        .pipe(
          timeout(this.config.wannachatStatusDefaultTimeoutInSeconds * 1000),
          catchError(err => {
            sub.unsubscribe();
            this.deleteUserHistory(me).then(
              () => this.searchStranger(me, opts).then(stranger => resolve(stranger))
            );

            return throwError(() => new err)
          })
        )
        .subscribe({
          next: event => {
            this.ignoreListService.saveInList(event.pubkey);
            this.replyChatInvitation(event, me)
              .then(user => user && resolve(user))
              .catch(e => {
                console.error(e);
                throw e;
              });

            sub.unsubscribe();
          },
          error: err => console.error(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']',err)
        });
    });
  }

  async replyChatInvitation(event: NostrEvent, me: Required<OmeglestrUser>): Promise<OmeglestrUser | void> {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'event was listen: ', event);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'it must be a chating invitation from ', event.pubkey, ', repling invitation...');

    await this.inviteToChating(me, event);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'replied... resolving... ');
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', '[searchStranger] unsubscribe');
    return Promise.resolve(OmeglestrUser.fromPubkey(event.pubkey));
  }

  private isChatingToMe(event: NostrEvent, me: Required<OmeglestrUser>): boolean {
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'is wannachat reply with chating? event: ', event);

    const result = event.tags
      .filter(([type]) => type === 'p')
      .find(([, pubkey]) => pubkey === me.pubkey) || [];

    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'is wannachat reply with chating?', !!result.length ? 'yes' : 'no');
    return !!result.length;
  }

  private inviteToChating(me: Required<OmeglestrUser>, strangeStatus: NostrEvent, includePow = false): Promise<NostrEvent> {
    const stranger = OmeglestrUser.fromPubkey(strangeStatus.pubkey);
    return this.publishChatInviteStatus(me, stranger, includePow);
  }

  private async listenChatingConfirmation(strangerWannachatEvent: NostrEvent, me: Required<OmeglestrUser>, opts: NpoolOpts): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'listening status update from: ', strangerWannachatEvent.pubkey);
      // FIXME: ensure that the error will make the unsubscription trigger the abort signal sending, to clean filters in relay
      const subscription: Subscription = this.findStrangerNostr
        .listenUserStatusUpdate(strangerWannachatEvent.pubkey, opts)
        .pipe(
          timeout(5000),
          catchError(err => throwError(() => new Error('chat confirmation timeout after 5s waiting, there is no stranger connected to this session')))
        )
        .subscribe({
          next: status => this.receiveChatingConfirmation(subscription, status, strangerWannachatEvent, me).then(is => {
            if (typeof is === 'boolean') {
              resolve(is);
            }
          }),
          error: (e) => {
            console.error(e);
            resolve(false);
          }
        });
    });
  }

  private receiveChatingConfirmation(sub: Subscription, status: NostrEvent, strangerWannachatEvent: NostrEvent, me: Required<OmeglestrUser>): Promise<boolean | undefined> {
    if (status.id === strangerWannachatEvent.id && status.content === 'wannachat') {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'stranger #wannachat status was listen, ignoring and waiting new status...');
      return Promise.resolve(undefined);
    }

    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', `stranger #${status.content} status was listen.`);
    sub.unsubscribe();
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', '[listenUserStatusUpdate] unsubscribe');
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'stranger ', strangerWannachatEvent.pubkey, ' update status: ', status);
    if (this.isChatingToMe(status, me)) {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'is "chating" status confirmed, resolved with true');
      return Promise.resolve(true);
    } else {
      console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'unexpected status was given, resolved with false, event: ', status);
      return Promise.resolve(false);
    }
  }

  private async publishWannaChatStatus(user: Required<OmeglestrUser>, includePow = false): Promise<NostrEvent> {
    const wannaChatStatus = await this.nostrEventFactory.createWannaChatUserStatus(user, includePow);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'updating my status to: ', wannaChatStatus);
    await this.npool.event(wannaChatStatus);

    return Promise.resolve(wannaChatStatus);
  }

  private async publishChatInviteStatus(user: Required<OmeglestrUser>, stranger: OmeglestrUser, includePow = false): Promise<NostrEvent> {
    const chatingStatus = await this.nostrEventFactory.createChatingUserStatus(user, stranger, includePow);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'updating my status to: ', chatingStatus);
    await this.npool.event(chatingStatus);

    return Promise.resolve(chatingStatus);
  }

  private async deleteUserHistory(user: Required<OmeglestrUser>): Promise<void> {
    const deleteStatus = this.nostrEventFactory.deleteUserHistory(user);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'deleting user history');
    await this.npool.event(deleteStatus);
  }

  connect(): Required<OmeglestrUser> {
    const session = OmeglestrUser.create();
    this.ignoreListService.saveInList(session.pubkey);
    return session;
  }

  async disconnect(user: Required<OmeglestrUser>): Promise<NostrEvent> {
    const disconnectStatus = await this.nostrEventFactory.createDisconnectedUserStatus(user);
    console.info(new Date().toLocaleString(), '[' + Math.floor(new Date().getTime() / 1000) + ']', 'updating my status to: ', disconnectStatus);
    await this.deleteUserHistory(user);
    await this.npool.event(disconnectStatus);

    return Promise.resolve(disconnectStatus);
  }
}
