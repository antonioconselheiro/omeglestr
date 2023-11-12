import { Injectable } from '@angular/core';
import { NostrService } from '../nostr-api/nostr.service';
import { NostrEventKind } from '@domain/nostr-event-kind.enum';

/**
 * Nip 38 e nip 4 vou usar
 * O nip 38 indica um status em que o usuário está (online, offline, ocupado e variações)
 * O 4 é chat direto criptografado
 * 1. O nsec é gerado
 * 2. Aplico um user status de interessado em bate papo
 * 3. Filtra nos relays eventos de user status interessado em bate papo
 * 4. Conecta os dois em chat criptografado e atualiza o user status pra ocupado
 * Cada nova conversa por ser um novo nsec
 */

@Injectable()
export class OmegleNostr {

  constructor(
    private nostrService: NostrService
  ) { }

  findByStatus() {
    this.nostrService.get([
      {
        kinds: [ NostrEventKind.UserStatuses ],
        '#t': [ 'wannachat' ]
      }
    ]);
  }

  updateUserStatus() {

  }

  listenDirectMessage() {

  }

  sendDirectMessage() {

  }

  deleteAccount() {

  }
}
