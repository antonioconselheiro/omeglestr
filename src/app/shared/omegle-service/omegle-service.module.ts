import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindStrangerNostr } from './find-stranger.nostr';
import { FindStrangerProxy } from './find-stranger.proxy';
import { OmegleConverter } from './omegle.converter';
import { TalkToStrangerProxy } from './talk-to-stranger.proxy';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    FindStrangerNostr,
    FindStrangerProxy,
    TalkToStrangerProxy,
    OmegleConverter
  ]
})
export class OmegleServiceModule { }
