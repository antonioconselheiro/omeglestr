import { Injectable } from '@angular/core';

@Injectable()
export class GlobalConfigService {

  readonly SEARCH_GLOBAL_WANNACHAT_TIMEOUT_IN_MS = 5_000;
  readonly WANNACHAT_STATUS_DEFAULT_TIMEOUT_IN_MS = 10_000;
}
