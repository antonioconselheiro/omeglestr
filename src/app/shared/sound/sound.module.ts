import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundNotificationService } from './sound-notification.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    SoundNotificationService
  ]
})
export class SoundModule { }
