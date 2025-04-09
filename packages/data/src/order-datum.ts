import { Data } from '@liqwid-labs/lucid'

/*
{
  fields: [
    {
      fields: [ {
        int: number // how much DJED to mint
      }, {
        int: number // how much ADA to send to the pool
      } ],
      constructor: 0 // mint DJED
    } | {
      fields: [ {
        int: number // how much DJED to burn
      } ],
      constructor: 1 // burn DJED
    } | {
      fields: [ {
        int: number // how much SHEN to mint
      }, {
        int: number // how much ADA to send to the pool
      } ],
      constructor: 2 // mint SHEN
    } | {
      fields: [ {
        int: number // how much SHEN to burn
      } ],
      constructor: 3 // burn SHEN
    },
    {
      fields: [ // address of order creator
        {
            fields: [
                {
                    bytes: string // payment key hash of order creator
                }
            ],
            "constructor": 0
        },
        {
          "fields": [
            {
              "fields": [
                {
                  "fields": [
                    {
                      "bytes": string // stake key hash of order creator, probably nullable.
                    }
                  ],
                  "constructor": 0
                }
              ],
              "constructor": 0
            }
          ],
          "constructor": 0
        }
      ],
      "constructor": 0
    },
    {
      fields: [ { int: number }, { int: number } ],
      constructor: 0
    },
    {
      int: number // posix epoch, potentially expiry or creation date?
    },
    {
      bytes: string // DJED order token minting policy id
    }
  ],
  constructor: 0,
}
*/

const OrderDatumSchema = Data.Object({})
export type OrderDatum = Data.Static<typeof OrderDatumSchema>
export const OrderDatum = OrderDatumSchema as unknown as OrderDatum