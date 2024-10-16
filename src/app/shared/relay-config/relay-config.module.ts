import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RelayConfigComponent } from './relay-config.component';
import { RelayConfigService } from './relay-config.service';

@NgModule({
  declarations: [
    RelayConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    RelayConfigComponent
  ],
  providers: [
    RelayConfigService
  ]
})
export class RelayConfigModule { }
