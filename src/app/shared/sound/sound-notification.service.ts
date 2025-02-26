import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundNotificationService {

  notify(): void {
    const audio = new Audio('./assets/sound-notification.wav');
    audio.play();
  }
}
