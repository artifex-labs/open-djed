import { Rational } from './rational'
import { Data, fromUnit, getAddressDetails, type LucidEvolution, type TxBuilder } from '@lucid-evolution/lucid'
import { type Registry } from './registry'
import { OrderDatum, OrderMintRedeemer, OracleDatum, PoolDatum } from '@reverse-djed/data'

export const createMintShenOrder = async ({ lucid, registry, amount, address }: { lucid: LucidEvolution, registry: Registry, amount: bigint, address: string }): Promise<TxBuilder> => {
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
  const { oracleFields: { adaExchangeRate } } = Data.from(oracleInlineDatum, OracleDatum)
  const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))
  const { adaInReserve, djedInCirculation, shenInCirculation } = Data.from(poolDatumCbor, PoolDatum)
  // https://www.reddit.com/r/cardano/comments/12cc64z/how_is_shen_price_determined/?rdt=64523
  const adaAmountToSend = new Rational(adaInReserve)
    .sub(new Rational(adaExchangeRate).invert().mul(djedInCirculation))
    .div(shenInCirculation)
    .mul(amount)
    .mul(Rational.ONE.add(registry.mintSHENFee))
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
            MintSHEN: {
              shenAmount: amount,
              adaAmount: adaAmountToSend,
            }
          },
          address: {
            paymentKeyHash: [paymentKeyHash],
            stakeKeyHash: [[[stakeKeyHash]]],
          },
          adaExchangeRate,
          creationDate: BigInt(ttl),
          orderStateTokenMintingPolicyId: fromUnit(registry.orderAssetId).policyId
        }, OrderDatum)
      },
      {
        [registry.orderAssetId]: 1n,
        // FIXME: We have a bug in this calculation, hence the +10 ADA. This might be okay though since I'd expect us to get the surplus ADA back during order fulfillment/cancellation.
        lovelace: adaAmountToSend + 10000000n,
      }
    )
    .mintAssets({
      [registry.orderAssetId]: 1n,
    }, OrderMintRedeemer)
    .pay.ToAddressWithData(address, { kind: 'asHash', value: poolDatumCbor }, {})
}