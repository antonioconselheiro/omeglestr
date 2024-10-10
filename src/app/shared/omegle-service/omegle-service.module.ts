import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FindStrangerNostr } from './find-stranger.nostr';
import { FindStrangerService } from './find-stranger.service';
import { TalkToStrangerNostr } from './talk-to-stranger.nostr';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    FindStrangerNostr,
    FindStrangerService,
    TalkToStrangerNostr
  ]
})
export class OmegleServiceModule { }
