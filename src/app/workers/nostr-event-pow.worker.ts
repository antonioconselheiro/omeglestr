/// <reference lib="webworker" />

import { UnsignedEvent } from "nostr-tools";
import { minePow } from "nostr-tools/nip13";

//  include pow to event, some relays require it for first event of a new pubkey
addEventListener('message', ({ data }) => {
  const powEvent = minePow(data as UnsignedEvent, 10);
  postMessage({ data: powEvent });
});
