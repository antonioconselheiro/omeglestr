import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrEventFactory } from './nostr-event.factory';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrEventFactory
  ]
})
export class NostrApiModule { }
