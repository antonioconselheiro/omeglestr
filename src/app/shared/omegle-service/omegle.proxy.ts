import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event, nip19 } from 'nostr-tools';
import { NostrService } from '@shared/nostr-api/nostr.service';
import { OmegleNostr } from './omegle.nostr';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrUser } from '@domain/nostr-user';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { GlobalConfigService } from '@shared/global-config/global-config.service';

@Injectable()
export class OmegleProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private globalConfigService: GlobalConfigService,
    private omegleNostr: OmegleNostr,
    private nostrService: NostrService
  ) {}

  publish<T extends number>(event: Event<T>): Promise<void> {
    return this.nostrService.publish(event);
  }
  
  /**
   * 1. escutar por cinco segundos algum #wannachat disponível
   * 1.a. #wannachat encontrado
   *   - publicar user status 'chating' com tag p preenchida com
   *      o pubkey do author do #wannachat
   *   - escuta todos eventos de user status emitido pelo pubkey
   *      do stranger escolhido
   * 1.a.a. user status é respondido com 'chating' usando seu pubkey
   *      como tag p
   *   - ir para 2;
   * 1.a.b. user status do stranger escolhido é modificado para um
   *      diferente do esperado
   *   - ir para 1;
   * 1.b. timeout atingido:
   *   - publicar #wannachat e escutar respostas para seu #wannachat
   *   - #wannachat é respondido com 'chating' usando seu pubkey como
   *      tag p
   *   - responder com user status 'chating' com o a tag p contendo o
   *      autor do evento recebido
   *   - ir para 2;
   * 
   * 2. Chat é iniciado
   *   - o textarea de mensagens e o enviar são habilitados
   *   - a escuta de eventos do tipo encrypted direct message devem
   *      ser escutados e propagados
   *   - o user status continua sendo atualizado como sem status (ou
   *      seja, '') typing e disconnected 
   */
  async searchStranger(user: Required<NostrUser>): Promise<NostrUser> {
    const strangerWannaChatStatus = await this.listenGlobalWannaChatStatus();

    if (strangerWannaChatStatus) {
      const stranger = NostrUser.fromPubkey(strangerWannaChatStatus.pubkey);
      const chating = this.nostrEventFactory.createChatingUserStatus(
        user, stranger
      );
    } else {

    }

    this.publishWannaChatStatus(user);
    try {
      const strangeStatus = await this.omegleNostr.listenGlobalWannaChatStatus();
      if (strangeStatus) {
        this.inviteRandomToChating(user, strangeStatus);
        //  depois disso precisarei escutar o status da
        //  confirmação de conexão do chat
      } else {
        this.publishWannaChatStatus(user);
      }
    } finally {
    }
  }

  private inviteRandomToChating(user: Required<NostrUser>, strangeStatus: Event[]): Promise<void> {
    const random = Math.floor(Math.random() * strangeStatus.length);
    const stranger = new NostrUser(nip19.npubEncode(strangeStatus[random].pubkey));
    return this.publishChatInviteStatus(user, stranger);
  }

  private listenWannaChatConfirmation(pubkey: string) {
    //  incluir timeout caso o evento demore pra ser encontrado
    //  incluir exception caso o evento recebido seja diferente do esperado
    //  nos dois casos acima devem ser respondidos por um disconnect event 
    this.omegleNostr
      .listenUpdatedProfileStatus(pubkey)
      .subscribe(event => {

      });
  }

  private listenGlobalWannaChatStatus(): Promise<NDKEvent | null> {
    return new Promise(resolve => {
      const subscription = this.omegleNostr
        .listenGlobalWannaChatStatus()
        .subscribe(ndk => {
          //  FIXME: BUG: check if this is the updated author status 
          //  FIXME: check if status has not expired
          resolve(ndk);
        });
  
      setTimeout(
        () => {
          subscription.unsubscribe();
          resolve(null);
        },
        this.globalConfigService.SEARCH_GLOBAL_WANNACHAT_TIMEOUT_IN_MS
      );
    });
  }

  private publishWannaChatStatus(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createWannaChatUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  private publishChatInviteStatus(user: Required<NostrUser>, stranger: NostrUser): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createChatingUserStatus(user, stranger);
    return this.nostrService.publish(wannaChatStatus);
  }

  async sendMessage(you: Required<NostrUser>, stranger: NostrUser, message: string): Promise<void> {
    const event = await this.nostrEventFactory.createEncryptedDirectMessage(you, stranger, message);
    return this.nostrService.publish(event);
  }

  // shows strange new messages and confirm your message was send
  listenMessages(): Observable<[]> {

  }

  isTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createTypingUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  stopTyping(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.cleanUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }

  disconnect(user: Required<NostrUser>): Promise<void> {
    const wannaChatStatus = this.nostrEventFactory.createDisconnectedUserStatus(user);
    return this.nostrService.publish(wannaChatStatus);
  }
}
