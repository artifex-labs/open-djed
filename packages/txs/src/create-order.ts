import { Data, Lucid } from '@liqwid-labs/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum } from '../../data/src/order-datum'
import { PoolStakeValidatorRedeemer } from '../../data/src'

export const createOrder = ({ lucid, network, purpose, asset, amount }: { lucid: Lucid, network: Network, purpose: 'Mint' | 'Burn', asset: 'DJED' | 'SHEN', amount: bigint }) => {
  const assetId = asset === 'DJED' ? registryByNetwork[network].djedAssetId : registryByNetwork[network].shenAssetId
  return lucid
    .newTx()
    .attachMintingPolicy(registryByNetwork[network].orderStateTokenMintingPolicy)
    .payToContract(
      registryByNetwork[network].orderAddress,
      {
        inline: Data.to({
          actionFields: {
            MintDJED: {
              djedAmount: 100n,
              adaAmount: 100n,
            }
          },
          address: {
            paymentKeyHash: [''],
            stakeKeyHash: [[['']]],
          },
          adaUsdExchangeRate: {
            numerator: 0n,
            denominator: 0n,
          },
          creationDate: 0n,
          orderStateTokenMintingPolicyId: ''
        }, OrderDatum)
      },
      {
        [registryByNetwork[network].orderStateTokenAssetId]: 1n,
      }
    )
    .withdraw(registryByNetwork[network].poolStakeValidatorAddress, 0n, PoolStakeValidatorRedeemer)
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: 1n,
    })
}