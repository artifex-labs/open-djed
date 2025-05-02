import { serve } from '@hono/node-server'
import { Lucid, Data, coreToUtxo, slotToUnixTime, CML, type LucidEvolution } from '@lucid-evolution/lucid'
import {
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
  parseOutRef,
  cancelOrderByOwner,
  type OracleUTxO,
  type OrderUTxO,
  type PoolUTxO,
} from '@reverse-djed/txs'
import { registryByNetwork } from '@reverse-djed/registry'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './env'
import { z } from 'zod'
import { Blockfrost } from '@reverse-djed/blockfrost'
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
  maxBurnableSHEN,
} from '@reverse-djed/math'
import TTLCache from '@isaacs/ttlcache'

const txRequestBodySchema = z.object({
  hexAddress: z.string(),
  utxosCborHex: z.array(z.string()),
})

const network = env.NETWORK

const blockfrost = new Blockfrost(env.BLOCKFROST_URL, env.BLOCKFROST_PROJECT_ID)

const registry = registryByNetwork[network]

const chainDataCache = new TTLCache({ ttl: 10_000, checkAgeOnGet: true })

export const getPoolUTxO = async () => {
  const cached = chainDataCache.get<PoolUTxO>('poolUTxO')
  if (cached) return cached
  const rawPoolUTxO = (await blockfrost.getUtxosWithUnit(registry.poolAddress, registry.poolAssetId))[0]
  if (!rawPoolUTxO) throw new Error(`Couldn't get pool utxo.`)
  const rawDatum =
    rawPoolUTxO.datum ??
    (rawPoolUTxO.datumHash ? await blockfrost.getDatum(rawPoolUTxO.datumHash) : undefined)
  if (!rawDatum) throw new Error(`Couldn't get pool datum.`)
  const poolUTxO = {
    ...rawPoolUTxO,
    poolDatum: Data.from(rawDatum, PoolDatum),
  }
  chainDataCache.set('poolUTxO', poolUTxO)
  return poolUTxO
}

export const getOracleUTxO = async () => {
  const cached = chainDataCache.get<OracleUTxO>('oracleUTxO')
  if (cached) return cached
  const rawOracleUTxO = (await blockfrost.getUtxosWithUnit(registry.oracleAddress, registry.oracleAssetId))[0]
  if (!rawOracleUTxO) throw new Error(`Couldn't get oracle utxo.`)
  const rawDatum =
    rawOracleUTxO.datum ??
    (rawOracleUTxO.datumHash ? await blockfrost.getDatum(rawOracleUTxO.datumHash) : undefined)
  if (!rawDatum) throw new Error(`Couldn't get oracle datum.`)
  const oracleUTxO = {
    ...rawOracleUTxO,
    oracleDatum: Data.from(rawDatum, OracleDatum),
  }
  chainDataCache.set('oracleUTxO', oracleUTxO)
  return oracleUTxO
}

export const getOrderUTxOs = async () => {
  const cached = chainDataCache.get<OrderUTxO[]>('orderUTxOs')
  if (cached) return cached
  const rawOrderUTxOs = await blockfrost.getUtxosWithUnit(registry.orderAddress, registry.orderAssetId)
  const orderUTxOs = await Promise.all(
    rawOrderUTxOs.map(async (rawOrderUTxO) => {
      const rawDatum =
        rawOrderUTxO.datum ??
        (rawOrderUTxO.datumHash ? await blockfrost.getDatum(rawOrderUTxO.datumHash) : undefined)
      if (!rawDatum) throw new Error(`Couldn't get order datum.`)
      return {
        ...rawOrderUTxO,
        orderDatum: Data.from(rawDatum, OrderDatum),
      }
    }),
  )
  chainDataCache.set('orderUTxOs', orderUTxOs)
  return orderUTxOs
}

export const getChainTime = async () => {
  const cached = chainDataCache.get<number>('now')
  if (cached) return cached
  const now = slotToUnixTime(network, await blockfrost.getLatestBlockSlot())
  chainDataCache.set('now', now)
  return now
}

export const getLucid = async () => {
  const cached = chainDataCache.get<LucidEvolution>('')
  if (cached) return cached
  const lucid = await Lucid(blockfrost, network)
  chainDataCache.set('lucid', lucid, { ttl: 600_000 })
  return lucid
}

export const getProtocolData = async () => {
  const [oracleUTxO, poolUTxO] = await Promise.all([getOracleUTxO(), getPoolUTxO()])
  return {
    DJED: {
      buy_price: djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage).toNumber(),
      sell_price: djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFeePercentage).toNumber(),
      circulating_supply: Number(poolUTxO.poolDatum.djedInCirculation) / 1e6,
      mintable_amount:
        Number(maxMintableDJED(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintDJEDFeePercentage)) /
        1e6,
      burnable_amount: Number(poolUTxO.poolDatum.djedInCirculation) / 1e6,
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
        Number(maxMintableSHEN(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintSHENFeePercentage)) /
        1e6,
      burnable_amount:
        Number(maxBurnableSHEN(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintSHENFeePercentage)) /
        1e6,
    },
    reserve: {
      amount: Number(poolUTxO.poolDatum.adaInReserve) / 1e6,
      ratio: reserveRatio(poolUTxO.poolDatum, oracleUTxO.oracleDatum).toNumber(),
    },
  }
}

const tokenSchema = z.enum(['DJED', 'SHEN'])
const actionSchema = z.enum(['mint', 'burn'])

const app = new Hono()
  .basePath('/api')
  .use(cors())
  .use(logger())
  .get(
    '/:token/:action/:amount/data',
    zValidator('param', z.object({ token: tokenSchema, action: actionSchema, amount: z.string() })),
    async (c) => {
      const [oracleUTxO, poolUTxO] = await Promise.all([getOracleUTxO(), getPoolUTxO()])
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
    '/:token/:action/:amount/tx',
    zValidator('param', z.object({ token: tokenSchema, action: actionSchema, amount: z.string() })),
    zValidator('json', txRequestBodySchema),
    async (c) => {
      const [lucid, oracleUTxO, poolUTxO, now] = await Promise.all([
        getLucid(),
        getOracleUTxO(),
        getPoolUTxO(),
        getChainTime(),
      ])
      const { token, action, amount: amountStr } = c.req.valid('param')
      const amount = BigInt(Math.round(Number(amountStr) * 1e6))
      if (amount < 0n) {
        throw new Error('Quantity must be positive number.')
      }
      const { hexAddress: address, utxosCborHex } = c.req.valid('json')
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
        now,
      }
      if (token === 'DJED') {
        if (action === 'mint') {
          return c.text((await createMintDjedOrder(config).complete({ localUPLCEval: false })).toCBOR())
        }
        return c.text((await createBurnDjedOrder(config).complete({ localUPLCEval: false })).toCBOR())
      }
      if (action === 'mint') {
        return c.text((await createMintShenOrder(config).complete({ localUPLCEval: false })).toCBOR())
      }
      return c.text((await createBurnShenOrder(config).complete({ localUPLCEval: false })).toCBOR())
    },
  )
  .get('/protocol-data', async (c) => c.json(await getProtocolData()))
  .get('/orders', async (c) => {
    const orderUTxOs = await getOrderUTxOs()
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
    '/cancel-order-tx/:order_out_ref',
    zValidator('param', z.object({ order_out_ref: z.string() })),
    zValidator('json', txRequestBodySchema),
    async (c) => {
      const [lucid, orderUTxOs] = await Promise.all([getLucid(), getOrderUTxOs()])
      const orderUTxORef = parseOutRef(c.req.valid('param').order_out_ref)
      const orderUTxO = orderUTxOs.find(
        (o) => o.txHash === orderUTxORef.txHash && o.outputIndex === orderUTxORef.outputIndex,
      )

      if (!orderUTxO)
        throw new Error(`Couldn't find order utxo for ref ${orderUTxORef.txHash}#${orderUTxORef.outputIndex}`)

      const { hexAddress, utxosCborHex } = c.req.valid('json')
      lucid.selectWallet.fromAddress(
        CML.Address.from_hex(hexAddress).to_bech32(),
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

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

export type AppType = typeof app
