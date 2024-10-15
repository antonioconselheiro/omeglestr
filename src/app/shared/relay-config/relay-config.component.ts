import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'omg-relay-config',
  templateUrl: './relay-config.component.html',
  styleUrl: './relay-config.component.scss'
})
export class RelayConfigComponent extends ModalableDirective<{ name: string }, boolean> {
  name!: string;

  override response = new Subject<boolean | void>();
  
  override onInjectData(data: { name: string }): void {
    this.name = data.name;
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
