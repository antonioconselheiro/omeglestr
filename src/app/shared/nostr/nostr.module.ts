import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NostrEventFactory } from './nostr-event.factory';
import { MainNPool } from './main.npool';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrEventFactory,
    MainNPool
  ]
})
export class NostrModule { }
