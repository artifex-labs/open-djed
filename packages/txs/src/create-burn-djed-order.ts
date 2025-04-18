import { Data, fromUnit, type LucidEvolution } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OrderMintRedeemer, PoolDatum, fromBech32 } from '@reverse-djed/data'
import { djedADABurnRate, operatorFee } from '@reverse-djed/math'
import type { OracleUTxO, PoolUTxO } from './types'

export const createBurnDjedOrder = ({
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
}) => {
  const now = Math.round((Date.now() - 20_000) / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes

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
              BurnDJED: {
                djedAmount: amount,
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
          poolUTxO.poolDatum.minADA +
          operatorFee(
            djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).mul(amount),
            registry.minOperatorFee,
            registry.maxOperatorFee,
            registry.operatorFeePercentage,
          ),
        [registry.djedAssetId]: amount,
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
