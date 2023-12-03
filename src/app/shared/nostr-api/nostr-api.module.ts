import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrEventFactory } from './nostr-event.factory';
import { NostrService } from './nostr.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService,
    NostrEventFactory
  ]
})
export class NostrApiModule { }
