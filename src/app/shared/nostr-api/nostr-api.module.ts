import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NostrService } from './nostr.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NostrService
  ]
})
export class NostrApiModule { }
