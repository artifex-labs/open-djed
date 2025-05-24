import { Constr, Data, type LucidEvolution, type UTxO } from '@lucid-evolution/lucid'
import { type Network, type Registry } from '@reverse-djed/registry'
import {
  OrderBurnRedeemer,
  ProcessOrderSpendOrderRedeemer,
  ProcessOrderSpendPoolRedeemer,
  toBech32,
} from '@reverse-djed/data'
import type { OrderUTxO, PoolUTxO } from './types'

export const processBurnShenOrder = ({
  lucid,
  registry,
  orderUTxO,
  poolUTxO,
  orderSpendingValidatorRefUTxO,
  orderMintingPolicyRefUTxO,
  network,
  poolSpendingValidatorRefUTxO,
}: {
  lucid: LucidEvolution
  registry: Registry
  orderUTxO: OrderUTxO
  poolUTxO: PoolUTxO
  orderSpendingValidatorRefUTxO: UTxO
  orderMintingPolicyRefUTxO: UTxO
  poolSpendingValidatorRefUTxO: UTxO
  network: Network
}) => {
  return (
    lucid
      .newTx()
      .readFrom([orderSpendingValidatorRefUTxO, orderMintingPolicyRefUTxO, poolSpendingValidatorRefUTxO])
      .collectFrom([orderUTxO], ProcessOrderSpendOrderRedeemer)
      .collectFrom([poolUTxO], ProcessOrderSpendPoolRedeemer)
      /*
    {
    "fields": [
        {
            "fields": [
                {
                // how much ADA was sent to the user (the actual amount sent can be larger than this)
                    "int": 26406681712
                },
                {
                // how much SHEN was burned in the order
                    "int": -24992817726
                }
            ],
            "constructor": 5
        },
        {
        // utxo reference of the order
            "fields": [
                {
                    "fields": [
                        {
                            "bytes": "10633a0ff20c32aeddcbcbdcd54dca6ee4858c50470ab7ecc9aa8e9b323fd42b"
                        }
                    ],
                    "constructor": 0
                },
                {
                    "int": 0
                }
            ],
            "constructor": 0
        }
    ],
    "constructor": 0
}
    */
      .pay.ToAddressWithData(
        toBech32(orderUTxO.orderDatum.address, network),
        {
          kind: 'inline',
          // NOTE: This is temporary. Need to figure out the actual format of this datum.
          value: Data.to(
            new Constr(0, [
              new Constr(5, []),
              new Constr(0, [new Constr(0, [orderUTxO.txHash]), BigInt(orderUTxO.outputIndex)]),
            ]),
          ),
        },
        {},
      )
      .pay.ToContract('addr1wx8vgeyxzyrm9qu6ju9fh4useecga8njlwtmqa2357luj3clkzzzx', {
        kind: 'inline',
        value: '',
      })
      .mintAssets(
        {
          [registry.orderAssetId]: -1n,
        },
        OrderBurnRedeemer,
      )
  )
}
