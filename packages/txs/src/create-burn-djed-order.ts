import { Data, fromUnit, getAddressDetails, type LucidEvolution } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OracleDatum, OrderMintRedeemer } from '@reverse-djed/data'
import { djedADABurnRate } from '@reverse-djed/math'

export const createBurnDjedOrder = async ({ lucid, registry, amount, address }: { lucid: LucidEvolution, registry: Registry, amount: bigint, address: string }) => {
  const now = Math.round((Date.now() - 20_000) / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes
  const { paymentCredential, stakeCredential } = getAddressDetails(address)
  const paymentKeyHash = paymentCredential?.hash
  if (!paymentKeyHash) throw new Error('Couldn\'t get payment key hash from address.')
  const stakeKeyHash = stakeCredential?.hash
  if (!stakeKeyHash) throw new Error('Couldn\'t get stake key hash from address.')
  const oracleUtxo = await lucid.utxoByUnit(registry.adaUsdOracleAssetId)
  const oracleInlineDatum = oracleUtxo.datum
  if (!oracleInlineDatum) throw new Error('Couldn\'t get oracle inline datum.')
  const oracleDatum = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))

  const adaAmountToSend = djedADABurnRate(oracleDatum, registry.burnDJEDFeePercentage)
    .ceil()
    .toBigInt()
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
          address: {
            paymentKeyHash: [paymentKeyHash],
            stakeKeyHash: [[[stakeKeyHash]]],
          },
          adaUSDExchangeRate: oracleDatum.oracleFields.adaUSDExchangeRate,
          creationDate: BigInt(ttl),
          orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId).policyId
        }, OrderDatum)
      },
      {
        [registry.orderAssetId]: 1n,
        // FIXME: We have a bug in this calculation, hence the +10 ADA. This might be okay though since I'd expect us to get the surplus ADA back during order fulfillment/cancellation.
        lovelace: adaAmountToSend + 10_000_000n,
        [registry.djedAssetId]: amount,
      }
    )
    .mintAssets({
      [registry.orderAssetId]: 1n,
    }, OrderMintRedeemer)
    .pay.ToAddressWithData(address, { kind: 'asHash', value: poolDatumCbor }, {})
}