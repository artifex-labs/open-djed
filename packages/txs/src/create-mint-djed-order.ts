import { Data, fromUnit, getAddressDetails, type LucidEvolution } from '@lucid-evolution/lucid'
import { registryByNetwork, type Network } from './registry'
import { OrderDatum, OrderStateTokenMintingPolicyMintRedeemer } from 'data'
import { OracleDatum } from '../../data/src/oracle-datum'
import { Rational } from './rational'

export const createMintDjedOrder = async ({ lucid, network, amount, address }: { lucid: LucidEvolution, network: Network, amount: bigint, address: string }) => {
  const now = Math.round(Date.now() / 1000) * 1000
  const ttl = now + 3 * 60 * 1000 // 3 minutes
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
  const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))

  const adaAmountToSend = new Rational(adaExchangeRate)
    .invert()
    .mul(amount)
    // 1.5% mint fee
    .mul({ numerator: 203n, denominator: 200n })
    .ceil()
    .toBigInt()
  return lucid
    .newTx()
    .readFrom([
      oracleUtxo,
      poolUtxo,
      // Idealy wouldn't hard code this, but dynamically finding reference script holding utxos is hard and this UTxO has existed since end 2023, meaning it's unlikely it'll get spent in the short term.
      ...await lucid.utxosByOutRef([{ txHash: '1a757d9840dfd77f5aa0223245b553d412328dadb10abc5225f4f8e53ae90ee0', outputIndex: 1 }]),
    ])
    .validFrom(now)
    .validTo(ttl)
    .addSigner(address)
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
          creationDate: BigInt(ttl),
          orderStateTokenMintingPolicyId: fromUnit(registryByNetwork[network].orderStateTokenAssetId).policyId
        }, OrderDatum)
      },
      {
        [registryByNetwork[network].orderStateTokenAssetId]: 1n,
        // FIXME: We have a bug in this calculation, hence the +10 ADA. This might be okay though since I'd expect us to get the surplus ADA back during order fulfillment/cancellation.
        lovelace: adaAmountToSend + 10_000_000n,
      }
    )
    .mintAssets({
      [registryByNetwork[network].orderStateTokenAssetId]: 1n,
    }, OrderStateTokenMintingPolicyMintRedeemer)
    .pay.ToAddressWithData(address, { kind: 'asHash', value: poolDatumCbor }, {})
}