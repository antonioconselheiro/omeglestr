> "I am sought of them that asked not for me; I am found of them that sought me not: I said, Behold me, behold me, unto a nation that was not called by my name."
> Isaiah 65:1

# Omegle on Nostr
*don't thread on Omegle*

## Fully Open Source Omegle
- [hosted in github pages](https://antonioconselheiro.github.io/omeglestr)

![Omeglestr](https://raw.githubusercontent.com/antonioconselheiro/ngx-parody-api/refs/heads/main/docs/imgs/omeglestr/2-omeglestr-chat-n-status.png)

## Implementation
It'll not need your `nsec` or connect to your signer, this will generate one nsec to each talk and in the end of each talk will clean all events emitted from your session. If the events are not deleted at the end, it'll expire into relay and be deleted anyway.
This also have a hardcoded relay included, no custom relays are need, if you want change it and find stranger to talk in other relays you must [fork](https://guides.github.com/activities/forking/) this repository by [clicking here](https://github.com/antonioconselheiro/omeglestr/fork). But this will be configurable in the future.

## Relay Compatibility
Need support to [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md), [NIP-38](https://github.com/nostr-protocol/nips/blob/master/38.md) and [NIP-40](https://github.com/nostr-protocol/nips/blob/master/40.md).

## Donate
Lighting donate: <a href="lightning:antonioconselheiro@getalby.com">lightning:antonioconselheiro@getalby.com</a>

![zap me](https://raw.githubusercontent.com/antonioconselheiro/antonioconselheiro/main/img/qrcode-wallet-lighting.png)

Bitcoin onchain donate: <a href="bitcoin:bc1qrm99lmmpwk7zsh7njpgthw87yvdm38j2lzpq7q">bc1qrm99lmmpwk7zsh7njpgthw87yvdm38j2lzpq7q</a>

![zap me](https://raw.githubusercontent.com/antonioconselheiro/antonioconselheiro/main/img/qrcode-wallet-bitcoin.png)

## Contribute
- See [CONTRIBUTE.md](./CONTRIBUTE.md)

## References
- https://www.omegle.com/
- https://angular.dev/style-guide
- https://github.com/nostr-protocol/nips
- https://nostrify.dev/
- https://github.com/antonioconselheiro/ngx-parody-api
- https://www.npmjs.com/package/@belomonte/ngx-parody-api
