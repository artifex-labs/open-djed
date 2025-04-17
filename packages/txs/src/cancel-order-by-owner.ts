import { Constr, Data, credentialToAddress, type LucidEvolution, type UTxO } from '@lucid-evolution/lucid'
import { type Network, type Registry } from './registry'
import { OrderDatum, CancelOrderSpendRedeemer, OrderBurnRedeemer } from '@reverse-djed/data'

export const cancelOrderByOwner = async ({
  lucid,
  registry,
  orderUtxo,
  network,
}: {
  lucid: LucidEvolution
  registry: Registry
  orderUtxo: UTxO
  network: Network
}) => {
  const orderInlineDatum = orderUtxo.datum
  if (!orderInlineDatum) throw new Error("Couldn't get order inline datum.")
  const {
    address: {
      paymentKeyHash: [paymentKeyHash],
      stakeKeyHash: [[[stakeKeyHash]]],
    },
  } = Data.from(orderInlineDatum, OrderDatum)
  const address = credentialToAddress(
    network,
    { type: 'Key', hash: paymentKeyHash },
    { type: 'Key', hash: stakeKeyHash },
  )

  return lucid
    .newTx()
    .readFrom([registry.orderSpendingValidatorReferenceUTxO, registry.orderMintingPolicyReferenceUTxO])
    .addSigner(address)
    .collectFrom([orderUtxo], CancelOrderSpendRedeemer)
    .pay.ToAddressWithData(
      address,
      {
        kind: 'inline',
        // NOTE: This is temporary. Need to figure out the actual format of this datum.
        value: Data.to(
          new Constr(0, [
            new Constr(11, []),
            new Constr(0, [new Constr(0, [orderUtxo.txHash]), BigInt(orderUtxo.outputIndex)]),
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
