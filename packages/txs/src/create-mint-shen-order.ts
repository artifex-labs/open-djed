import { shenADAMintRate, operatorFee } from '@reverse-djed/math'
import { Data, fromUnit, type LucidEvolution, type TxBuilder } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OrderMintRedeemer, PoolDatum, fromBech32 } from '@reverse-djed/data'
import type { OracleUTxO, PoolUTxO } from './types'

export const createMintShenOrder = async ({
  lucid,
  registry,
  amount,
  address,
  oracleUTxO,
  poolUTxO,
}: {
  lucid: LucidEvolution
  registry: Registry
  amount: bigint
  address: string
  oracleUTxO: OracleUTxO
  poolUTxO: PoolUTxO
}): Promise<TxBuilder> => {
  const now = Math.round((Date.now() - 20_000) / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes
  const adaAmountToSend = shenADAMintRate(
    poolUTxO.poolDatum,
    oracleUTxO.oracleDatum,
    registry.mintSHENFeePercentage,
  )
    .mul(amount)
    .ceil()
    .toBigInt()
  return lucid
    .newTx()
    .readFrom([oracleUTxO, poolUTxO, registry.orderMintingPolicyReferenceUTxO])
    .validFrom(now)
    .validTo(ttl)
    .addSigner(address)
    .pay.ToContract(
      registry.orderAddress,
      {
        kind: 'inline',
        value: Data.to(
          {
            actionFields: {
              MintSHEN: {
                shenAmount: amount,
                adaAmount: adaAmountToSend,
              },
            },
            address: fromBech32(address),
            adaUSDExchangeRate: oracleUTxO.oracleDatum.oracleFields.adaUSDExchangeRate,
            creationDate: BigInt(ttl),
            orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId).policyId,
          },
          OrderDatum,
        ),
      },
      {
        [registry.orderAssetId]: 1n,
        lovelace:
          adaAmountToSend +
          poolUTxO.poolDatum.minADA +
          operatorFee(adaAmountToSend, registry.operatorFeeConfig),
      },
    )
    .mintAssets(
      {
        [registry.orderAssetId]: 1n,
      },
      OrderMintRedeemer,
    )
    .pay.ToAddressWithData(address, { kind: 'asHash', value: Data.to(poolUTxO.poolDatum, PoolDatum) }, {})
}
