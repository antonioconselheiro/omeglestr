import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalConfigService } from './global-config.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    GlobalConfigService
  ]
})
export class GlobalConfigModule { }
