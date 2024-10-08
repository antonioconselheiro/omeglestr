import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindStrangerNostr } from './find-stranger.nostr';
import { FindStrangerService } from './find-stranger.service';
import { OmegleConverter } from './omegle.converter';
import { TalkToStrangerProxy } from './talk-to-stranger.proxy';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    FindStrangerNostr,
    FindStrangerService,
    TalkToStrangerProxy,
    OmegleConverter
  ]
})
export class OmegleServiceModule { }
