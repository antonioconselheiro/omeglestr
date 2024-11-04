import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NPoolService } from './main.npool';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NPoolService
  ]
})
export class NostrModule { }
