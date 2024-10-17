/// <reference lib="webworker" />

import { UnsignedEvent } from "nostr-tools";
import { minePow } from "nostr-tools/nip13";

//  include pow of 28 to event, some relays require it for first event of a new pubkey
addEventListener('message', ({ data }) => {
  const defaultDificult = 28;
  const powEvent = minePow(data as UnsignedEvent, defaultDificult);

  postMessage({ data: powEvent });
});
