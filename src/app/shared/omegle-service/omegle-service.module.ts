import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OmegleNostr } from './omegle.nostr';
import { OmegleProxy } from './omegle.proxy';
import { OmegleConverter } from './omegle.converter';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    OmegleNostr,
    OmegleProxy,
    OmegleConverter
  ]
})
export class OmegleServiceModule { }
