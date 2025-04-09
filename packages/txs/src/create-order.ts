import { Data, Lucid } from '@liqwid-labs/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum } from '../../data/src/order-datum'

export const createOrder = ({ lucid, network, purpose, asset, amount }: { lucid: Lucid, network: Network, purpose: 'Mint' | 'Burn', asset: 'DJED' | 'SHEN', amount: bigint }) => {
  const assetId = asset === 'DJED' ? registryByNetwork[network].djedAssetId : registryByNetwork[network].shenAssetId
  return lucid
    .newTx()
    .attachMintingPolicy(registryByNetwork[network].orderStateTokenMintingPolicy)
    .payToContract(
      registryByNetwork[network].orderAddress,
      {
        inline: Data.to({}, OrderDatum)
      },
      {
        [registryByNetwork[network].orderStateTokenAssetId]: 1n,
      }
    )
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: 1n,
    })
}