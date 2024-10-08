import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { NostrEventFactory } from '@shared/nostr/nostr-event.factory';
import { Event } from 'nostr-tools';
import { FindStrangerNostr } from './find-stranger.nostr';
import { MainNPool } from '@shared/nostr/main.npool';

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
    this.publishWannaChatStatus(me);

    return new Promise(resolve => {
      const subscription = this.findStrangerNostr.listenChatAvailable(me)
        .subscribe(async event => {
          console.info(new Date().toLocaleString(), 'event was listen: ', event);
          if (event.pubkey === me.pubkey) {
            console.info(new Date().toLocaleString(), 'lol, my own event, ignoring...');
            return;
          }

          const chatingInvite = this.isChatingInvite(event);
          const chatingToMe = this.isChatingToMe(event, me);

          console.info('event is chating invite? ', chatingInvite ? 'yes' : 'no');
          console.info('event is chating to me? ', chatingToMe ? 'yes' : 'no');

          if (chatingInvite && chatingToMe) {
            subscription.unsubscribe();
            console.info(new Date().toLocaleString(),'it\'s a chating invitation from ', event.pubkey, ' repling invitation...');
            await this.inviteToChating(me, event);
            console.info(new Date().toLocaleString(),'replied... resolving... ');
            resolve(NostrUser.fromPubkey(event.pubkey));
            console.info(new Date().toLocaleString(),'[searchStranger] unsubscribe');
          } else if (this.isWannaChat(event)) {
 
              console.info(new Date().toLocaleString(),'[searchStranger] unsubscribe');
              subscription.unsubscribe();
              console.info(new Date().toLocaleString(), 'inviting ', event.pubkey, ' to chat and listening confirmation');
              const listening = this.listenChatingConfirmation(event, me);
              await this.inviteToChating(me, event);
              const isChatingConfirmation = await listening;

              if (isChatingConfirmation) {
                resolve(NostrUser.fromPubkey(event.pubkey));
              } else {
                const stranger = await this.searchStranger(me);
                resolve(stranger);
              }
          }
        });
    });
  }

  private isChatingInvite(event: Event): boolean {
    return event.content === 'chating';
  }

  private isWannaChat(event: Event): boolean {
    return event.content === 'wannachat';
  }

  private isChatingToMe(event: Event, me: Required<NostrUser>): boolean {
    console.info(new Date().toLocaleString(), 'is wannachat reply with chating? event: ', event);

    const result = event.tags
      .filter(([type]) => type === 'p')
      .find(([,pubkey]) => pubkey === me.pubkey) || [];

    console.info(new Date().toLocaleString(), 'is wannachat reply with chating?', !!result.length ? 'yes' : 'no');
    return !!result.length;
  }

  private inviteToChating(me: Required<NostrUser>, strangeStatus: Event): Promise<void> {
    const stranger = NostrUser.fromPubkey(strangeStatus.pubkey);
    return this.publishChatInviteStatus(me, stranger);
  }

  private async listenChatingConfirmation(strangerEvent: Event, me: Required<NostrUser>): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.info(new Date().toLocaleString(),'listening status update from: ', strangerEvent.pubkey);
      const subscription = this.findStrangerNostr
        .listenUserStatusUpdate(strangerEvent.pubkey)
        .subscribe(status => {
          if (status.id === strangerEvent.id && status.content === 'wannachat') {
            console.info(new Date().toLocaleString(), 'stranger #wannachat status was listen, ignoring and waiting new status...');
            return;
          }

          subscription.unsubscribe();
          console.info(new Date().toLocaleString(), '[listenUserStatusUpdate] unsubscribe');
          console.info(new Date().toLocaleString(), 'stranger ', strangerEvent.pubkey,' update status: ', status);
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

  private publishWannaChatStatus(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    console.info(new Date().toLocaleString(),'updating my status to: ', wannaChatStatus);
    return this.mainPool.event(wannaChatStatus);
  }

  private publishChatInviteStatus(user: Required<NostrUser>, stranger: NostrUser): Promise<void> {
    const chatingStatus = this.nostrEventFactory.createChatingUserStatus(user, stranger);
    console.info(new Date().toLocaleString(),'updating my status to: ', chatingStatus);
    return this.mainPool.event(chatingStatus);
  }

  connect(): Required<NostrUser> {
    return NostrUser.create();
  }

  disconnect(user: Required<NostrUser>): Promise<void> {
    const disconnectStatus = this.nostrEventFactory.createDisconnectedUserStatus(user);
    console.info(new Date().toLocaleString(),'updating my status to: ', disconnectStatus);
    return this.mainPool.event(disconnectStatus);
  }
}
