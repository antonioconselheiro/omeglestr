import { Injectable } from '@angular/core';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';
import { NostrUser } from '@domain/nostr-user';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { GlobalConfigService } from '@shared/global-config/global-config.service';
import { NostrEventFactory } from '@shared/nostr-api/nostr-event.factory';
import { NostrService } from '@shared/nostr-api/nostr.service';
import { Event } from 'nostr-tools';
import { firstValueFrom } from 'rxjs';
import { FindStrangerNostr } from './find-stranger.nostr';

@Injectable()
export class FindStrangerProxy {

  constructor(
    private nostrEventFactory: NostrEventFactory,
    private globalConfigService: GlobalConfigService,
    private omegleNostr: FindStrangerNostr,
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
    const strangeStatus = await this.listenGlobalWannaChatStatus();

    // 1.a.
    if (strangeStatus) {
      // 1.a.a.
      await this.inviteToChating(user, strangeStatus);

      // 1.a.b.
      const event = await this.listenWannaChatConfirmation(
        strangeStatus.pubkey, user
      );

      if (event) {
        return Promise.resolve(NostrUser.fromPubkey(event.pubkey));
      } else {
        this.disconnect(user);
        //  disconnect and go to 1.b
      }
    }

    // 1.b
    this.publishWannaChatStatus(user);
    const event = await this.listenWannaChatRequest(user);

    return Promise.resolve(NostrUser.fromPubkey(event.pubkey));
  }

  private inviteToChating(user: Required<NostrUser>, strangeStatus: NDKEvent): Promise<void> {
    const stranger = NostrUser.fromPubkey(strangeStatus.pubkey);
    return this.publishChatInviteStatus(user, stranger);
  }

  private listenWannaChatRequest(user: Required<NostrUser>): Promise<NDKEvent> {
    //  FIXME: verificar se o firstValueFrom da unsubscribe depois de receber o primeiro valor
    return firstValueFrom(this.omegleNostr.listenChatingResponse(user));
  }

  private listenWannaChatConfirmation(pubkey: string, currentUser: Required<NostrUser>): Promise<NDKEvent | null> {
    //  incluir timeout caso o evento demore pra ser encontrado
    //  nos dois casos acima devem ser respondidos por um disconnect event 
    return new Promise((resolve, reject) => {
      let timeoutId = 0;
      const subscription = this.omegleNostr
        .listenUpdatedProfileStatus(pubkey)
        .subscribe(event => {
          clearTimeout(timeoutId);
          const isForMe = this.checkEventIsWannaChatConfirmation(
            event, currentUser
          );

          if (isForMe) {
            resolve(event);
          } else {
            resolve(null);
          }
        });
  
      timeoutId = +setTimeout(
        () => {
          subscription.unsubscribe();
          resolve(null);
        },
        this.globalConfigService.SEARCH_GLOBAL_WANNACHAT_TIMEOUT_IN_MS
      );
    });
  }

  private checkEventIsWannaChatConfirmation(
    event: NDKEvent, currentUser: Required<NostrUser>
  ): boolean {
    const taggedPubkey = event.tags
      .filter(([tagType]) => tagType === 'p')
      .map(([,profile]) => profile)
      .at(0);

    const strangerStatusIsForMe = taggedPubkey === currentUser.publicKeyHex;
    
    if (strangerStatusIsForMe) {
      return true;
    }

    return false;
  }

  private async listenGlobalWannaChatStatus(): Promise<NDKEvent | null> {
    const publishedStatus = await this.omegleNostr.getRecentOmegleStatus();
    const status = this.searchWannaGetEventStatus(publishedStatus);

    if (status) {
      return Promise.resolve(status);
    }

    return new Promise(resolve => {
      let timeoutId = 0;
      const subscription = this.omegleNostr
        .listenNewWannaChatStatus()
        .subscribe(ndk => {
          clearTimeout(timeoutId);
          resolve(ndk);
        });
  
      timeoutId = +setTimeout(
        () => {
          subscription.unsubscribe();
          resolve(null);
        },
        this.globalConfigService.SEARCH_GLOBAL_WANNACHAT_TIMEOUT_IN_MS
      );
    });
  }

  private searchWannaGetEventStatus(events: NDKEvent[]): NDKEvent | null {
    const groupedByAuthor: { [pubkey: string]: NDKEvent[] } = {};
    events.forEach(event => {
      if (!groupedByAuthor[event.pubkey]) {
        groupedByAuthor[event.pubkey] = [];
      }

      groupedByAuthor[event.pubkey].push(event);
    });

    Object
      .keys(groupedByAuthor)
      .forEach(pubkey => {
        groupedByAuthor[pubkey] = groupedByAuthor[pubkey]
          .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      });

    const wannaChatEvent = Object
      .values(groupedByAuthor)
      .find(grouped => grouped[0].kind === NostrEventKind.UserStatuses && grouped[0].content === 'wannachat');

    return wannaChatEvent && wannaChatEvent[0] || null;
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
