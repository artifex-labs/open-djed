import { Data, fromUnit, getAddressDetails, type LucidEvolution } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OracleDatum, OrderMintRedeemer, PoolDatum, fromBech32 } from '@reverse-djed/data'
import { djedADABurnRate, operatorFee } from '@reverse-djed/math'

export const createBurnDjedOrder = async ({ lucid, registry, amount, address }: { lucid: LucidEvolution, registry: Registry, amount: bigint, address: string }) => {
  const now = Math.round((Date.now() - 20_000) / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes
  const oracleUtxo = await lucid.utxoByUnit(registry.adaUsdOracleAssetId)
  const oracleInlineDatum = oracleUtxo.datum
  if (!oracleInlineDatum) throw new Error('Couldn\'t get oracle inline datum.')
  const oracleDatum = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))
  const poolDatum = Data.from(poolDatumCbor, PoolDatum)

  return lucid
    .newTx()
    .readFrom([
      oracleUtxo,
      poolUtxo,
      registry.orderMintingPolicyReferenceUTxO,
    ])
    .validFrom(now)
    .validTo(ttl)
    .addSigner(address)
    .pay.ToContract(
      registry.orderAddress,
      {
        kind: 'inline',
        value: Data.to({
          actionFields: {
            BurnDJED: {
              djedAmount: amount,
            },
          },
          address: fromBech32(address),
          adaUSDExchangeRate: oracleDatum.oracleFields.adaUSDExchangeRate,
          creationDate: BigInt(ttl),
          orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId).policyId
        }, OrderDatum)
      },
      {
        [registry.orderAssetId]: 1n,
        lovelace: poolDatum.minADA + operatorFee(djedADABurnRate(oracleDatum, registry.burnDJEDFeePercentage).mul(amount), registry.minOperatorFee, registry.maxOperatorFee, registry.operatorFeePercentage),
        [registry.djedAssetId]: amount,
      }
    )
    .mintAssets({
      [registry.orderAssetId]: 1n,
    }, OrderMintRedeemer)
    .pay.ToAddressWithData(address, { kind: 'asHash', value: poolDatumCbor }, {})
}