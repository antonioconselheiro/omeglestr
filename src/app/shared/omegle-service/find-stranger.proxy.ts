import { Injectable } from '@angular/core';
import { NostrUser } from '@domain/nostr-user';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrService } from '@shared/nostr-api/nostr.service';
import { Event } from 'nostr-tools';
import { FindStrangerNostr } from './find-stranger.nostr';

@Injectable()
export class FindStrangerProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private findStrangerNostr: FindStrangerNostr,
    private nostrService: NostrService
  ) { }

  publish(event: Event): Promise<void> {
    return this.nostrService.publish(event);
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
          console.info('event was listen: ', event);
          if (event.pubkey === me.publicKeyHex) {
            console.info('lol, my own event');
            return;
          }

          if (this.isChatingInvite(event)) {
            subscription.unsubscribe();
            console.info('it\'s a chating invitation from ', event.pubkey, ' repling invitation...');
            await this.inviteToChating(me, event);
            console.info('replied... resolving... ');
            resolve(NostrUser.fromPubkey(event.pubkey));
            console.info('[searchStranger] unsubscribe');
          } else {
            console.info('event is current user status?');
            const is = await this.isWannaChatCurrentStrangerStatus(event);
            console.info(is ? 'yes' : 'no');

            if (is) {
              console.info('[searchStranger] unsubscribe');
              subscription.unsubscribe();
              console.info('inviting ', event.pubkey, ' to chat');
              await this.inviteToChating(me, event);
              const isChatingConfirmation = await this.listenChatingConfirmation(event, me);

              if (isChatingConfirmation) {
                resolve(NostrUser.fromPubkey(event.pubkey));
              } else {
                this.publishWannaChatStatus(me);
              }
            }
          }
        });
    });
  }

  private isChatingInvite(event: Event): boolean {
    return event.content === 'chating';
  }

  private isChatingToMe(event: Event, me: Required<NostrUser>): boolean {
    console.info('is wannachat reply with chating? event: ', event);

    const result = event.tags
      .filter(([type]) => type === 'p')
      .find(([,pubkey]) => pubkey === me.publicKeyHex) || [];

    console.info(!!result.length ? 'yes' : 'no');
    return !!result.length;
  }

  private inviteToChating(me: Required<NostrUser>, strangeStatus: Event): Promise<void> {
    const stranger = NostrUser.fromPubkey(strangeStatus.pubkey);
    return this.publishChatInviteStatus(me, stranger);
  }

  private async listenChatingConfirmation(strangerEvent: Event, me: Required<NostrUser>): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      const subscription = this.findStrangerNostr
        .getUserStatusUpdate(strangerEvent.pubkey)
        .subscribe(status => {
          if (status.id === strangerEvent.id) {
            console.info('stranger #wannachat status was listen, ignoring and waiting new status...');
            return;
          }

          subscription.unsubscribe();
          console.info('stranger ', strangerEvent.pubkey,' update status: ', status);
          if (this.isChatingToMe(status, me)) {
            resolve(true);
            console.info('[listenChatingConfirmation] unsubscribe (true)');
          } else {
            console.info('event status is not "chating", event: ', status);
            resolve(false);
            console.info('[listenChatingConfirmation] unsubscribe (false)');
          }
        });
    });
  }

  private async isWannaChatCurrentStrangerStatus(event: Event): Promise<boolean> {
    const [currentStatusEvent] = await this.findStrangerNostr.getUpdatedProfileStatus(event.pubkey);
    console.info('current status: ', currentStatusEvent);
    return currentStatusEvent.id === event.id;
  }

  private publishWannaChatStatus(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  private publishChatInviteStatus(user: Required<NostrUser>, stranger: NostrUser): Promise<void> {
    const chatingStatus = this.nostrEventFactory.createChatingUserStatus(user, stranger);
    return this.nostrService.publish(chatingStatus);
  }

  connect(): Required<NostrUser> {
    return NostrUser.create();
  }

  disconnect(user: Required<NostrUser>): Promise<void> {
    const disconnectStatus = this.nostrEventFactory.createDisconnectedUserStatus(user);
    return this.nostrService.publish(disconnectStatus);
  }
}
