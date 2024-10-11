import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrEventFactory } from './nostr-event.factory';
import { NPoolService } from './main.npool';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrEventFactory,
    NPoolService
  ]
})
export class NostrModule { }
