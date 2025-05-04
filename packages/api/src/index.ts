import { serve } from '@hono/node-server'
import { Lucid, Data, coreToUtxo, slotToUnixTime, CML, type LucidEvolution } from '@lucid-evolution/lucid'
import {
  createBurnDjedOrder,
  createBurnShenOrder,
  createMintDjedOrder,
  createMintShenOrder,
  type OracleUTxO,
  type OrderUTxO,
  type PoolUTxO,
} from '@reverse-djed/txs'
import { registryByNetwork } from '@reverse-djed/registry'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './env'
import { z } from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { validator as zValidator } from 'hono-openapi/zod'
import { Blockfrost } from '@reverse-djed/blockfrost'
import { OracleDatum, OrderDatum, PoolDatum } from '@reverse-djed/data'
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getOrderUTxOs = async () => {
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

const tokenSchema = z.enum(['DJED', 'SHEN']).openapi({ example: 'DJED' })
const actionSchema = z.enum(['mint', 'burn']).openapi({ example: 'mint' })

const app = new Hono()
  .basePath('/api')
  .use(cors())
  .use(logger())
  .get('/protocol-data', describeRoute({ description: 'Get on-chain protocol data' }), async (c) => {
    const [oracleFields, poolDatum] = await Promise.all([
      getOracleUTxO().then((o) => o.oracleDatum.oracleFields),
      getPoolUTxO().then((p) => p.poolDatum),
    ])
    return c.json({
      oracleDatum: {
        oracleFields: {
          adaUSDExchangeRate: {
            numerator: oracleFields.adaUSDExchangeRate.numerator.toString(),
            denominator: oracleFields.adaUSDExchangeRate.denominator.toString(),
          },
        },
      },
      poolDatum: {
        djedInCirculation: poolDatum.djedInCirculation.toString(),
        shenInCirculation: poolDatum.shenInCirculation.toString(),
        adaInReserve: poolDatum.adaInReserve.toString(),
        minADA: poolDatum.minADA.toString(),
      },
    })
  })
  .post(
    '/:token/:action/:amount/tx',
    describeRoute({
      description: 'Create a transaction to perform an action on a token.',
      tags: ['Action'],
      responses: {
        200: {
          description: 'Transaction CBOR ready to be signed',
          content: {
            'text/plain': {
              example: 'CBOR',
            },
          },
        },
        400: {
          description: 'Bad Request',
          content: {
            'text/plain': {
              example: 'Bad Request',
            },
          },
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'text/plain': {
              example: 'Internal Server Error',
            },
          },
        },
      },
    }),
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
      const { hexAddress, utxosCborHex } = c.req.valid('json')
      const address = CML.Address.from_hex(hexAddress).to_bech32()
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
