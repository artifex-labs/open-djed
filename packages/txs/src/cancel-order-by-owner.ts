import { Data, credentialToAddress, type LucidEvolution, type UTxO } from '@lucid-evolution/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum, CancelDJEDMintOrderRedeemer, OrderStateTokenMintingPolicyBurnRedeemer } from 'data'

export const cancelOrderByOwner = async ({ lucid, network, orderUtxo }: { lucid: LucidEvolution, network: Network, orderUtxo: UTxO }) => {
  const now = Date.now() - 20_000
  const orderInlineDatum = orderUtxo.datum
  if (!orderInlineDatum) throw new Error('Couldn\'t get order inline datum.')
  const { address: { paymentKeyHash: [paymentKeyHash], stakeKeyHash: [[[stakeKeyHash]]] } } = Data.from(orderInlineDatum, OrderDatum)
  const address = credentialToAddress(network, { type: 'Key', hash: paymentKeyHash }, { type: 'Key', hash: stakeKeyHash })

  return lucid
    .newTx()
    .readFrom([
      registryByNetwork[network].orderStateTokenMintingPolicyReferenceUTxO,
      registryByNetwork[network].orderSpendingValidatorReferenceUTxO,
    ])
    .validFrom(now)
    .validTo(now + 1 * 60 * 1000) // 1 minute
    .collectFrom([orderUtxo], CancelDJEDMintOrderRedeemer)
    .addSigner(address)
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: -1n,
    }, OrderStateTokenMintingPolicyBurnRedeemer)
}