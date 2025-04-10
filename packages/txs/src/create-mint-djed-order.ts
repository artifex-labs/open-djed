import { Data, fromUnit, getAddressDetails, type LucidEvolution } from '@lucid-evolution/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum, OrderStateTokenMintingPolicyMintRedeemer } from 'data'
import { OracleDatum } from '../../data/src/oracle-datum'

export const createMintDjedOrder = async ({ lucid, network, amount, address }: { lucid: LucidEvolution, network: Network, amount: bigint, address: string }) => {
  const now = Date.now()
  const { paymentCredential, stakeCredential } = getAddressDetails(address)
  const paymentKeyHash = paymentCredential?.hash
  if (!paymentKeyHash) throw new Error('Couldn\'t get payment key hash from address.')
  const stakeKeyHash = stakeCredential?.hash
  if (!stakeKeyHash) throw new Error('Couldn\'t get stake key hash from address.')
  const oracleUtxo = await lucid.utxoByUnit(registryByNetwork[network].adaUsdOracleAssetId)
  const oracleInlineDatum = oracleUtxo.datum
  if (!oracleInlineDatum) throw new Error('Couldn\'t get oracle inline datum.')
  const { oracleFields: { adaExchangeRate } } = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registryByNetwork[network].poolStateTokenAssetId)

  const adaAmountToSend = amount * adaExchangeRate.denominator / adaExchangeRate.numerator
  return lucid
    .newTx()
    .attach.MintingPolicy(registryByNetwork[network].orderStateTokenMintingPolicy)
    .readFrom([oracleUtxo, poolUtxo])
    .validFrom(now)
    .validTo(now + 1 * 60 * 1000) // 1 minute
    .pay.ToContract(
      registryByNetwork[network].orderAddress,
      {
        kind: 'inline',
        value: Data.to({
          actionFields: {
            MintDJED: {
              djedAmount: amount,
              adaAmount: adaAmountToSend,
            }
          },
          address: {
            paymentKeyHash: [paymentKeyHash],
            stakeKeyHash: [[[stakeKeyHash]]],
          },
          adaExchangeRate,
          creationDate: BigInt(now + 30_000),
          orderStateTokenMintingPolicyId: fromUnit(registryByNetwork[network].orderStateTokenAssetId).policyId
        }, OrderDatum)
      },
      {
        [registryByNetwork[network].orderStateTokenAssetId]: 1n,
        lovelace: adaAmountToSend + 10_000_000n,
      }
    )
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: 1n,
    }, OrderStateTokenMintingPolicyMintRedeemer)
}