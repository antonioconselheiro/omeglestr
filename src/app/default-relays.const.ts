import { RelayConfigService } from "@belomonte/nostr-ngx";

RelayConfigService.setDefaultApplicationRelays({
  'ws://umbrel.local:4848': {
    url: 'ws://umbrel.local:4848',
    read: true,
    write: true
  }
});
