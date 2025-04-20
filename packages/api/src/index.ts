import * as CML from '@anastasia-labs/cardano-multiplatform-lib-browser'
import { Lucid, Data, coreToUtxo } from '@lucid-evolution/lucid'
import {
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
  registryByNetwork,
  parseOutRef,
  cancelOrderByOwner,
} from '@reverse-djed/txs'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { cors } from 'hono/cors'
import { env } from './env'
import { z } from 'zod'
// FIXME: This import.
import { MyBlockfrost } from '../../cli/src/blockfrost'
import { OracleDatum, OrderDatum, PoolDatum } from '@reverse-djed/data'
import {
  djedADABurnRate,
  djedADAMintRate,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
  shenADABurnRate,
  shenADAMintRate,
  operatorFee as getOperatorFee,
} from '@reverse-djed/math'

const txRequestBodySchema = z.object({
  address: z.string(),
  utxosCborHex: z.array(z.string()),
})

const network = env.VITE_NETWORK

const lucid = await Lucid(
  new MyBlockfrost(
    `https://cardano-${network.toLocaleLowerCase()}.blockfrost.io/api/v0`,
    env.VITE_BLOCKFROST_PROJECT_ID,
  ),
  network,
)
const registry = registryByNetwork[network]

const rawPoolUTxO = (await lucid.utxosAtWithUnit(registry.poolAddress, registry.poolAssetId))[0]
if (!rawPoolUTxO) throw new Error(`Couldn't find pool utxo.`)
const poolUTxO = {
  ...rawPoolUTxO,
  poolDatum: Data.from(Data.to(await lucid.datumOf(rawPoolUTxO)), PoolDatum),
}
const rawOracleUTxO = (await lucid.utxosAtWithUnit(registry.oracleAddress, registry.oracleAssetId))[0]
if (!rawOracleUTxO) throw new Error(`Couldn't find oracle utxo.`)
const oracleUTxO = {
  ...rawOracleUTxO,
  oracleDatum: Data.from(Data.to(await lucid.datumOf(rawOracleUTxO)), OracleDatum),
}

const rawOrderUTxOs = await lucid.utxosAtWithUnit(registry.orderAddress, registry.orderAssetId)
const orderUTxOs = await Promise.all(
  rawOrderUTxOs.map(async (o) => ({
    ...o,
    orderDatum: Data.from(Data.to(await lucid.datumOf(o)), OrderDatum),
  })),
)

const tokenSchema = z.enum(['DJED', 'SHEN'])
const actionSchema = z.enum(['mint', 'burn'])

const app = new Hono()
  .use('/api/*', cors())
  .get(
    '/api/:token/:action/:amount/data',
    zValidator('param', z.object({ token: tokenSchema, action: actionSchema, amount: z.string() })),
    (c) => {
      const { token, action, amount: amountStr } = c.req.valid('param')
      const amount = BigInt(Math.round(Number(amountStr) * 1e6))
      if (amount < 0n) {
        throw new Error('Quantity must be positive number.')
      }
      let baseCost = 0
      let operatorFee = 0
      if (token === 'DJED' && action === 'mint') {
        const baseCostRational = djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage).mul(
          amount,
        )
        baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
        operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
      } else if (token === 'DJED' && action === 'burn') {
        const baseCostRational = djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).mul(
          amount,
        )
        baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
        operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
      } else if (token === 'SHEN' && action === 'mint') {
        const baseCostRational = shenADAMintRate(
          poolUTxO.poolDatum,
          oracleUTxO.oracleDatum,
          registry.mintSHENFeePercentage,
        ).mul(amount)
        baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
        operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
      } else if (token === 'SHEN' && action === 'burn') {
        const baseCostRational = shenADABurnRate(
          poolUTxO.poolDatum,
          oracleUTxO.oracleDatum,
          registry.burnSHENFeePercentage,
        ).mul(amount)
        baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
        operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
      }
      return c.json({
        base_cost: baseCost,
        // NOTE: Need to figure out how to share code between this and txs.
        operator_fee: operatorFee,
        cost: baseCost + operatorFee,
        min_ada: Number(poolUTxO.poolDatum.minADA) / 1e6,
      })
    },
  )
  .post(
    '/api/:token/:action/:amount/tx',
    zValidator('param', z.object({ token: tokenSchema, action: actionSchema, amount: z.string() })),
    zValidator('json', txRequestBodySchema),
    async (c) => {
      const { token, action, amount: amountStr } = c.req.valid('param')
      const amount = BigInt(Math.round(Number(amountStr) * 1e6))
      if (amount < 0n) {
        throw new Error('Quantity must be positive number.')
      }
      const { address, utxosCborHex } = c.req.valid('json')
      lucid.selectWallet.fromAddress(
        address,
        utxosCborHex.map((cborHex) => coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex))),
      )
      const config = {
        lucid,
        registry,
        amount: amount,
        address,
        oracleUTxO,
        poolUTxO,
        orderMintingPolicyRefUTxO: registry.orderMintingPolicyRefUTxO,
        now: Math.round((Date.now() - 20_000) / 1000) * 1000,
      }
      if (token === 'DJED') {
        if (action === 'mint') {
          return c.text((await createMintDjedOrder(config).complete()).toCBOR())
        }
        return c.text((await createBurnDjedOrder(config).complete()).toCBOR())
      }
      if (action === 'mint') {
        return c.text((await createMintShenOrder(config).complete()).toCBOR())
      }
      return c.text((await createBurnShenOrder(config).complete()).toCBOR())
    },
  )
  .get('/api/protocol-data', async (c) => {
    return c.json({
      DJED: {
        buy_price: djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage).toNumber(),
        sell_price: djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).toNumber(),
        circulating_supply: Number(poolUTxO.poolDatum.djedInCirculation) / 1e6,
        mintable_amount:
          Number(
            maxMintableDJED(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage),
          ) / 1e6,
      },
      SHEN: {
        buy_price: shenADAMintRate(
          poolUTxO.poolDatum,
          oracleUTxO.oracleDatum,
          registry.mintSHENFeePercentage,
        ).toNumber(),
        sell_price: shenADABurnRate(
          poolUTxO.poolDatum,
          oracleUTxO.oracleDatum,
          registry.burnSHENFeePercentage,
        ).toNumber(),
        circulating_supply: Number(poolUTxO.poolDatum.shenInCirculation) / 1e6,
        mintable_amount:
          Number(
            maxMintableSHEN(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintSHENFeePercentage),
          ) / 1e6,
      },
      reserve: {
        amount: Number(poolUTxO.poolDatum.adaInReserve) / 1e6,
        ratio: reserveRatio(poolUTxO.poolDatum, oracleUTxO.oracleDatum).toNumber(),
      },
    })
  })
  .get('/api/orders', async (c) => {
    return c.json(
      orderUTxOs.map((o) => ({
        date: Number(o.orderDatum.creationDate),
        txHash: o.txHash,
        action:
          'MintDJED' in o.orderDatum.actionFields || 'MintSHEN' in o.orderDatum.actionFields
            ? 'Mint'
            : 'Burn',
        status: 'Pending',
      })),
    )
  })
  .post(
    '/api/cancel-order-tx/:order_out_ref',
    zValidator('param', z.object({ order_out_ref: z.string() })),
    zValidator('json', txRequestBodySchema),
    async (c) => {
      const orderUTxORef = parseOutRef(c.req.valid('param').order_out_ref)
      const orderUTxO = orderUTxOs.find(
        (o) => o.txHash === orderUTxORef.txHash && o.outputIndex === orderUTxORef.outputIndex,
      )

      if (!orderUTxO)
        throw new Error(`Couldn't find order utxo for ref ${orderUTxORef.txHash}#${orderUTxORef.outputIndex}`)

      const { address, utxosCborHex } = c.req.valid('json')
      lucid.selectWallet.fromAddress(
        address,
        utxosCborHex.map((cborHex) => coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex))),
      )
      return c.text(
        (
          await cancelOrderByOwner({
            lucid,
            registry,
            orderUTxO,
            orderSpendingValidatorRefUTxO: registry.orderSpendingValidatorRefUTxO,
            orderMintingPolicyRefUTxO: registry.orderMintingPolicyRefUTxO,
            network,
          }).complete()
        ).toCBOR(),
      )
    },
  )

export default app

export type AppType = typeof app
