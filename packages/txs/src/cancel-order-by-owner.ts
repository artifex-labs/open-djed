import { Data, Lucid, type UTxO } from '@liqwid-labs/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum, CancelDJEDMintOrderRedeemer, OrderStateTokenMintingPolicyBurnRedeemer } from 'data'
import { lucidUtilsByNetwork } from './utils'

export const cancelOrderByOwner = async ({ lucid, network, orderUtxo }: { lucid: Lucid, network: Network, orderUtxo: UTxO }) => {
  const now = Date.now()
  const orderInlineDatum = orderUtxo.datum
  if (!orderInlineDatum) throw new Error('Couldn\'t get order inline datum.')
  const { address: { paymentKeyHash: [paymentKeyHash], stakeKeyHash: [[[stakeKeyHash]]] } } = Data.from(orderInlineDatum, OrderDatum)
  const address = lucidUtilsByNetwork[network].credentialToAddress({ type: 'Key', hash: paymentKeyHash }, { type: 'Key', hash: stakeKeyHash })

  return lucid
    .newTx()
    .attachMintingPolicy(registryByNetwork[network].orderStateTokenMintingPolicy)
    .attachSpendingValidator(registryByNetwork[network].orderSpendingValidator)
    .validFrom(now)
    .validTo(now + 1 * 60 * 1000) // 1 minute
    .collectFrom([orderUtxo], CancelDJEDMintOrderRedeemer)
    .addSigner(address)
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: -1n,
    }, OrderStateTokenMintingPolicyBurnRedeemer)
}