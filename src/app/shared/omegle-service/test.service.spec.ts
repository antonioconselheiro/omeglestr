import { NostrEvent, NostrFilter } from "@nostrify/nostrify";
import { matchFilters } from "nostr-tools";

describe('Testing filter', () => {
  
  it('event should match', () => {
    const event: NostrEvent = {
      content: "chating",
      created_at: 1728388365,
      id: "86e85a5a42b373b9b14938db2c06aee8952b7bd9baf0d82219336079b514e522",
      kind: 30315,
      pubkey: "5fafd083d6de86b2f04ce39449af685ee7e91d2c4822a5fc904f40f2c3ec7c20",
      sig: "4b47a1fafbde2be32063332eb4362b957c237d407eee8d724bc2e898648abadd265eda448d306d22e60ed2289a4a10f82cd2209debf6bbcd266112343fa5cdc5",
      tags: [
        ['d', 'general'],
        ['p', 'a1cf7669ece0bc3fdad393102e87c4f073ae85dfced43ca08b37d86728e25510'],
        ['t', 'chating'],
        ['t', 'omegle']
      ]
    };

    const filters: NostrFilter[] = [
      {
        kinds: [30315],
        "#t": [ "wannachat", "omegle"],
        since: 1728387745
      },
    
      {
        kinds: [30315],
        "#t": ["chating", "omegle"],
        "#p": ["a1cf7669ece0bc3fdad393102e87c4f073ae85dfced43ca08b37d86728e25510"]
      }
    ];

    expect(matchFilters(filters, event)).toBeTruthy();
  });
});
