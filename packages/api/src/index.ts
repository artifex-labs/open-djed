import * as CML from '@anastasia-labs/cardano-multiplatform-lib-browser'
import { Lucid, Data, coreToUtxo } from '@lucid-evolution/lucid'
import {
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
  registryByNetwork,
} from '@reverse-djed/txs'
import { Hono } from 'hono'
import { env } from './env'
import { z } from 'zod'
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

const app = new Hono()

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

const tokenSchema = z.enum(['DJED', 'SHEN'])
const actionSchema = z.enum(['mint', 'burn'])

app.get('/api/:token/:action/:quantity/data', (c) => {
  const token = tokenSchema.parse(c.req.param('token'))
  const action = actionSchema.parse(c.req.param('action'))
  const quantity = BigInt(Math.floor(Number(c.req.param('quantity')) * 10e5))
  if (quantity < 0n) {
    throw new Error('Quantity must be positive number.')
  }
  let baseCost = 0
  let operatorFee = 0
  if (token === 'DJED' && action === 'mint') {
    const baseCostRational = djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage).mul(
      quantity,
    )
    baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
    operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
  } else if (token === 'DJED' && action === 'burn') {
    const baseCostRational = djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).mul(
      quantity,
    )
    const baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
    operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
  } else if (token === 'SHEN' && action === 'mint') {
    const baseCostRational = shenADAMintRate(
      poolUTxO.poolDatum,
      oracleUTxO.oracleDatum,
      registry.mintSHENFeePercentage,
    ).mul(quantity)
    baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
    operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
  } else if (token === 'SHEN' && action === 'burn') {
    const baseCostRational = shenADABurnRate(
      poolUTxO.poolDatum,
      oracleUTxO.oracleDatum,
      registry.burnSHENFeePercentage,
    ).mul(quantity)
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
})

const txRequestBodySchema = z
  .object({
    address: z.string(),
    utxosCborHex: z.array(z.string()),
  })
  .transform(({ address, utxosCborHex }) => ({
    address,
    utxos: utxosCborHex.map((cborHex) => coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex))),
  }))

app.post('/api/:token/:action/:amount/tx', async (c) => {
  const token = tokenSchema.parse(c.req.param('token'))
  const action = actionSchema.parse(c.req.param('action'))
  const amount = BigInt(Math.floor(Number(c.req.param('amount')) * 10e6))
  if (amount < 0n) {
    throw new Error('Quantity must be positive number.')
  }
  const { address, utxos } = txRequestBodySchema.parse(await c.req.json())
  lucid.selectWallet.fromAddress(address, utxos)
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
})

app.get('/api/protocol_data', async (c) => {
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

app.get('/api/orders', async (c) => {
  const rawOrderUTxOs = await lucid.utxosAtWithUnit(registry.orderAddress, registry.orderAssetId)
  const orderUTxOs = await Promise.all(
    rawOrderUTxOs.map(async (o) => ({
      ...o,
      orderDatum: Data.from(Data.to(await lucid.datumOf(o)), OrderDatum),
    })),
  )
  return c.json(orderUTxOs)
})

app.post('/api/cancel-order-tx/:order_out_ref', async (c) => {
  const orderOutRef = c.req.param('order_out_ref')
  const { address, utxos } = txRequestBodySchema.parse(await c.req.json())
  return c.text('<cbor-here>')
})

export default app
