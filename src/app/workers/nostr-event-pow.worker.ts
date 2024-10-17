/// <reference lib="webworker" />

import { getEventHash, UnsignedEvent } from "nostr-tools";
import { getPow, minePow } from "nostr-tools/nip13";

//  include pow to event, some relays require it for first event of a new pubkey
addEventListener('message', ({ data }) => {
  const powEvent = minePow(data as UnsignedEvent, getPow(getEventHash(data)));
  postMessage({ data: powEvent });
});
