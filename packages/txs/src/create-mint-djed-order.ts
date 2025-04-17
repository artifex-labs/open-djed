import { Data, fromUnit, getAddressDetails, type LucidEvolution } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OracleDatum, OrderMintRedeemer, PoolDatum } from '@reverse-djed/data'
import { Rational, djedADAMintRate, maxBigInt, minBigInt } from '@reverse-djed/math'

export const createMintDjedOrder = async ({
  lucid,
  registry,
  amount,
  address,
}: {
  lucid: LucidEvolution
  registry: Registry
  amount: bigint
  address: string
}) => {
  const now = Math.round((Date.now() - 20_000) / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes
  const { paymentCredential, stakeCredential } = getAddressDetails(address)
  const paymentKeyHash = paymentCredential?.hash
  if (!paymentKeyHash) throw new Error("Couldn't get payment key hash from address.")
  const stakeKeyHash = stakeCredential?.hash
  if (!stakeKeyHash) throw new Error("Couldn't get stake key hash from address.")
  const oracleUtxo = await lucid.utxoByUnit(registry.adaUsdOracleAssetId)
  const oracleInlineDatum = oracleUtxo.datum
  if (!oracleInlineDatum) throw new Error("Couldn't get oracle inline datum.")
  const oracleDatum = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))
  const poolDatum = Data.from(poolDatumCbor, PoolDatum)

  const adaAmountToSend = djedADAMintRate(oracleDatum, registry.mintDJEDFeePercentage)
    .mul(amount)
    .ceil()
    .toBigInt()
  const operatorFee = maxBigInt(
    registry.minOperatorFee,
    minBigInt(
      new Rational(registry.operatorFeePercentage).mul(adaAmountToSend).ceil().toBigInt(),
      registry.maxOperatorFee,
    ),
  )
  return lucid
    .newTx()
    .readFrom([oracleUtxo, poolUtxo, registry.orderMintingPolicyReferenceUTxO])
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
              MintDJED: {
                djedAmount: amount,
                adaAmount: adaAmountToSend,
              },
            },
            address: {
              paymentKeyHash: [paymentKeyHash],
              stakeKeyHash: [[[stakeKeyHash]]],
            },
            adaUSDExchangeRate: oracleDatum.oracleFields.adaUSDExchangeRate,
            creationDate: BigInt(ttl),
            orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId).policyId,
          },
          OrderDatum,
        ),
      },
      {
        [registry.orderAssetId]: 1n,
        lovelace: adaAmountToSend + poolDatum.minADA + operatorFee,
      },
    )
    .mintAssets(
      {
        [registry.orderAssetId]: 1n,
      },
      OrderMintRedeemer,
    )
    .pay.ToAddressWithData(address, { kind: 'asHash', value: poolDatumCbor }, {})
}
