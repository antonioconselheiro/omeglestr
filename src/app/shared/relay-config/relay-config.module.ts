import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RelayConfigComponent } from './relay-config.component';

@NgModule({
  declarations: [
    RelayConfigComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    RelayConfigComponent
  ]
})
export class RelayConfigModule { }
