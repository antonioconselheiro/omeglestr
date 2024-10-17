import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { RelayConfigService } from './relay-config.service';
import { normalizeURL } from 'nostr-tools/utils';

@Component({
  selector: 'omg-relay-config',
  templateUrl: './relay-config.component.html',
  styleUrl: './relay-config.component.scss'
})
export class RelayConfigComponent extends ModalableDirective<void, boolean> implements OnInit {

  override response = new Subject<boolean | void>();
  relays: string[] = [];

  constructor(
    private relayConfigService: RelayConfigService
  ) {
    super();
  }

  ngOnInit(): void {
    this.relays = this.relayConfigService.getConfig();
  }

  removeRelay(relay: string): void {
    const normalizedRelay = normalizeURL(relay);
    const indexNotFound = -1;
    const indexOf = this.relays.indexOf(normalizedRelay);

    if (indexOf !== indexNotFound) {
      this.relays.splice(indexOf, 1);
    }
  }

  addRelay(el: { value: string }): void {
    if (el.value) {
      this.relays = [...new Set([...this.relays, normalizeURL(el.value)])];
      el.value = ''
    }
  }

  ok(): void {
    this.response.next(true);
    this.close();
  }

  cancel(): void {
    this.response.next(false);
    this.close();
  }

  useDefault(): void {
    this.relays = import.meta.env.NG_APP_RELAYS.split(',').map(normalizeURL);
    this.save();
  }

  save(): void {
    this.relayConfigService.saveConfig([...new Set(this.relays)]);
    this.close();
  }
}
