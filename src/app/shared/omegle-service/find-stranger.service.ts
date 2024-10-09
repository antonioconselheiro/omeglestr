import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { NostrEvent } from '@nostrify/nostrify';
import { MainNPool } from '@shared/nostr/main.npool';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { Event, kinds } from 'nostr-tools';
import { FindStrangerNostr } from './find-stranger.nostr';

@Injectable()
export class FindStrangerService {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private findStrangerNostr: FindStrangerNostr,
    private mainPool: MainNPool
  ) { }

  publish(event: Event): Promise<void> {
    return this.mainPool.event(event);
  }

  /**
   * 1.a
   * - publicar #wannachat e escutar respostas para seu #wannachat
   * - escutar novas publicações de #wannachat
   * 
   * 1.a.a - novo #wannachat publicado é escutado
   * - user status é respondido com 'chating' usando seu pubkey
   *      como tag p
   * 
   * 1.a.a.a - evento é respondido
   * - ir para 2
   * 
   * 1.a.a.b - o usuário convidado responde a outra solicitação ou ocorre timeout
   * - voltar a escutar seu #wanna chat e novas publicações como em 1.a
   * 
   * 1.a.b - meu #wannachat é respondido com 'chating'
   * - ir para 2
   * 
   * 2. Chat é iniciado
   *   - o textarea de mensagens e o enviar são habilitados
   *   - a escuta de eventos do tipo encrypted direct message devem
   *      ser escutados e propagados
   *   - o user status continua sendo atualizado como sem status (ou
   *      seja, '') typing e disconnected 
   */
  async searchStranger(me: Required<NostrUser>): Promise<NostrUser> {
    let status: NostrEvent;
    const wannaChat = await this.findStrangerNostr.queryChatAvailable();
    if (wannaChat) {
      console.info(new Date().toLocaleString(), 'inviting ', wannaChat.pubkey, ' to chat and listening confirmation');
      const listening = this.listenChatingConfirmation(wannaChat, me);
      status = await this.inviteToChating(me, wannaChat);
      const isChatingConfirmation = await listening;

      if (isChatingConfirmation) {
        return Promise.resolve(NostrUser.fromPubkey(wannaChat.pubkey));
      }
    }

    status = await this.publishWannaChatStatus(me);

    return new Promise(resolve => {
      this.findStrangerNostr.listenWannachatResponse(me)
        .subscribe(event => {
          this.replyChatInvitation(event, me, status)
            .then(user => user && resolve(user))
        });
    });
  }

  async replyChatInvitation(event: NostrEvent, me: Required<NostrUser>, status?: NostrEvent): Promise<NostrUser | void> {
    console.info(new Date().toLocaleString(), 'event was listen: ', event);
    console.info(new Date().toLocaleString(), 'it must be a chating invitation from ', event.pubkey, ', repling invitation...');
    if (status) {
      await this.deleteEvent(me, status);
    }

    status = await this.inviteToChating(me, event);
    console.info(new Date().toLocaleString(), 'replied... resolving... ');
    console.info(new Date().toLocaleString(), '[searchStranger] unsubscribe');
    return Promise.resolve(NostrUser.fromPubkey(event.pubkey));
  }

  private isChatingToMe(event: Event, me: Required<NostrUser>): boolean {
    console.info(new Date().toLocaleString(), 'is wannachat reply with chating? event: ', event);

    const result = event.tags
      .filter(([type]) => type === 'p')
      .find(([, pubkey]) => pubkey === me.pubkey) || [];

    console.info(new Date().toLocaleString(), 'is wannachat reply with chating?', !!result.length ? 'yes' : 'no');
    return !!result.length;
  }

  private inviteToChating(me: Required<NostrUser>, strangeStatus: Event): Promise<NostrEvent> {
    const stranger = NostrUser.fromPubkey(strangeStatus.pubkey);
    return this.publishChatInviteStatus(me, stranger);
  }

  private async listenChatingConfirmation(strangerEvent: Event, me: Required<NostrUser>): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.info(new Date().toLocaleString(), 'listening status update from: ', strangerEvent.pubkey);
      const subscription = this.findStrangerNostr
        .listenUserStatusUpdate(strangerEvent.pubkey)
        .subscribe(status => {
          if (status.id === strangerEvent.id && status.content === 'wannachat') {
            console.info(new Date().toLocaleString(), 'stranger #wannachat status was listen, ignoring and waiting new status...');
            return;
          }

          subscription.unsubscribe();
          console.info(new Date().toLocaleString(), '[listenUserStatusUpdate] unsubscribe');
          console.info(new Date().toLocaleString(), 'stranger ', strangerEvent.pubkey, ' update status: ', status);
          if (this.isChatingToMe(status, me)) {
            console.info(new Date().toLocaleString(), 'is "chating" status confirmed, resolved with true');
            resolve(true);
          } else {
            console.info(new Date().toLocaleString(), 'unexpected status was given, resolved with false, event: ', status);
            resolve(false);
          }
        });
    });
  }

  private async publishWannaChatStatus(user: Required<NostrUser>): Promise<NostrEvent> {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    console.info(new Date().toLocaleString(), 'updating my status to: ', wannaChatStatus);
    await this.mainPool.event(wannaChatStatus);

    return Promise.resolve(wannaChatStatus);
  }

  private async publishChatInviteStatus(user: Required<NostrUser>, stranger: NostrUser): Promise<NostrEvent> {
    const chatingStatus = this.nostrEventFactory.createChatingUserStatus(user, stranger);
    console.info(new Date().toLocaleString(), 'updating my status to: ', chatingStatus);
    await this.mainPool.event(chatingStatus);

    return Promise.resolve(chatingStatus);
  }

  private async deleteEvent(user: Required<NostrUser>, event: NostrEvent): Promise<void> {
    const deleteEvent = this.nostrEventFactory.deleteEvent(user, event);
    console.info(new Date().toLocaleString(), 'deleting event: ', event);
    await this.mainPool.event(deleteEvent);
  }

  connect(): Required<NostrUser> {
    return NostrUser.create();
  }

  async disconnect(user: Required<NostrUser>): Promise<NostrEvent> {
    const disconnectStatus = this.nostrEventFactory.createDisconnectedUserStatus(user);
    console.info(new Date().toLocaleString(), 'updating my status to: ', disconnectStatus);
    await this.mainPool.event(disconnectStatus);

    return Promise.resolve(disconnectStatus);
  }
}
