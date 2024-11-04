import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OmegleNPoolOpts } from './omegle.npool-opts';
import { POOL_OPTIONS_TOKEN } from '@belomonte/ngx-parody-api';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    {
      provide: POOL_OPTIONS_TOKEN,
      useClass: OmegleNPoolOpts
    }
  ]
})
export class PoolModule { }
