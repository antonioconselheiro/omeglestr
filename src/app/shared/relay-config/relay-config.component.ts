import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { RelayConfigService } from './relay-config.service';

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

  ok(): void {
    this.response.next(true);
    this.close();
  }

  cancel(): void {
    this.response.next(false);
    this.close();
  }
}
