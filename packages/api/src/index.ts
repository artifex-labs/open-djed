import * as _CML from '@anastasia-labs/cardano-multiplatform-lib-browser'
import { Blockfrost, Lucid, Data } from '@lucid-evolution/lucid'
import { registryByNetwork } from '@reverse-djed/txs'
import { Hono } from 'hono'
import { env } from './env'
import { z } from 'zod'
import { MyBlockfrost } from '../../cli/src/blockfrost'
import { OracleDatum, PoolDatum } from '@reverse-djed/data'
import {
  djedADABurnRate,
  djedADAMintRate,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
  shenADABurnRate,
  shenADAMintRate,
} from '@reverse-djed/math'

const app = new Hono()

const tokenSchema = z.enum(['DJED', 'SHEN'])
const actionSchema = z.enum(['mint', 'burn'])

app.get('/api/:token/:action/:quantity/data', (c) => {
  const token = tokenSchema.parse(c.req.param('token'))
  const action = actionSchema.parse(c.req.param('action'))
  const quantity = BigInt(Math.floor(Number(c.req.param('quantity')) * 10e6))
  if (quantity < 0n) {
    throw new Error('Quantity must be positive number.')
  }
  return c.json({
    base_cost: 0,
    operator_fee: 0n,
    cost: 0,
    min_ada: 0,
  })
})

const txRequestBodySchema = z.object({
  address: z.string(),
  utxos: z.array(z.string()),
})

app.post('/api/:token/:action/:quantity/tx', async (c) => {
  const token = tokenSchema.parse(c.req.param('token'))
  const action = actionSchema.parse(c.req.param('action'))
  const quantity = BigInt(Math.floor(Number(c.req.param('quantity')) * 10e6))
  if (quantity < 0n) {
    throw new Error('Quantity must be positive number.')
  }
  const { address, utxos } = txRequestBodySchema.parse(await c.req.json())
  return c.text('<cbor-here>')
})

app.get('/api/protocol_data', async (c) => {
  const lucid = await Lucid(
    new MyBlockfrost(
      `https://cardano-${env.VITE_NETWORK.toLocaleLowerCase()}.blockfrost.io/api/v0`,
      env.VITE_BLOCKFROST_PROJECT_ID,
    ),
    env.VITE_NETWORK,
  )
  const registry = registryByNetwork[env.VITE_NETWORK]

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
  return c.json({
    djed: {
      buy_price: djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage).toNumber(),
      sell_price: djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).toNumber(),
      circulating_supply: Number(poolUTxO.poolDatum.djedInCirculation) / 1e6,
      mintable_amount:
        Number(maxMintableDJED(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage)) /
        1e6,
    },
    shen: {
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
        Number(maxMintableSHEN(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintSHENFeePercentage)) /
        1e6,
    },
    reserve: {
      amount: Number(poolUTxO.poolDatum.adaInReserve) / 1e6,
      ratio: reserveRatio(poolUTxO.poolDatum, oracleUTxO.oracleDatum).toNumber(),
    },
  })
})

app.get('/api/orders', (c) => {
  return c.json([])
})

app.post('/api/cancel-order-tx/:order_out_ref', async (c) => {
  const orderOutRef = tokenSchema.parse(c.req.param('order_out_ref'))
  const { address, utxos } = txRequestBodySchema.parse(await c.req.json())
  return c.text('<cbor-here>')
})

export default app
