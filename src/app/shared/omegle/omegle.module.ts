import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OmegleNostr } from './omegle.nostr';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    OmegleNostr
  ]
})
export class OmegleModule { }
