import { Constr, Data, credentialToAddress, type LucidEvolution } from '@lucid-evolution/lucid'
import { type Network, type Registry } from './registry'
import { CancelOrderSpendRedeemer, OrderBurnRedeemer, toBech32 } from '@reverse-djed/data'
import type { OrderUTxO } from './types'

export const cancelOrderByOwner = async ({
  lucid,
  registry,
  orderUTxO,
  network,
}: {
  lucid: LucidEvolution
  registry: Registry
  orderUTxO: OrderUTxO
  network: Network
}) => {
  const address = toBech32(orderUTxO.orderDatum.address, network)

  return lucid
    .newTx()
    .readFrom([registry.orderSpendingValidatorReferenceUTxO, registry.orderMintingPolicyReferenceUTxO])
    .addSigner(address)
    .collectFrom([orderUTxO], CancelOrderSpendRedeemer)
    .pay.ToAddressWithData(
      address,
      {
        kind: 'inline',
        // NOTE: This is temporary. Need to figure out the actual format of this datum.
        value: Data.to(
          new Constr(0, [
            new Constr(11, []),
            new Constr(0, [new Constr(0, [orderUTxO.txHash]), BigInt(orderUTxO.outputIndex)]),
          ]),
        ),
      },
      {},
    )
    .mintAssets(
      {
        [registry.orderAssetId]: -1n,
      },
      OrderBurnRedeemer,
    )
}
