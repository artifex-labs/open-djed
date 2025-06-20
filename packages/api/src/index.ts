import { serve } from '@hono/node-server'
import {
  Lucid,
  Data,
  coreToUtxo,
  slotToUnixTime,
  CML,
  type LucidEvolution,
  type TxBuilder,
} from '@lucid-evolution/lucid'
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
import { createMiddleware } from 'hono/factory'
import {
  AppError,
  BadRequestError,
  BalanceTooLowError,
  InternalServerError,
  ScriptExecutionError,
  UTxOContentionError,
  ValidationError,
} from './errors'

//NOTE: We only need this cache for transactions, not for other requests. Using this for `protocol-data` sligltly increases the response time.
const requestCache = new TTLCache<string, { value: Response; expiry: number }>({ ttl: 10_000 })
const cacheMiddleware = createMiddleware(async (c, next) => {
  const cacheKey = `${c.req.url}:${JSON.stringify(await c.req.json().catch(() => null))}`
  const cachedResponse = requestCache.get(cacheKey)

  if (cachedResponse && cachedResponse.expiry > Date.now()) {
    const { value } = cachedResponse
    const clonedBody = await value.clone().text()
    c.res = new Response(clonedBody, {
      headers: value.headers,
      status: value.status,
      statusText: value.statusText,
    })
    return
  }

  await next()

  const clonedResponse = c.res.clone()
  const clonedBody = await clonedResponse.text()
  requestCache.set(cacheKey, {
    value: new Response(clonedBody, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
    }),
    expiry: Date.now() + 10_000,
  })
})

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

async function completeTransaction(createOrderFn: () => TxBuilder) {
  try {
    const tx = await createOrderFn().complete({ localUPLCEval: false })
    return tx
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('EvaluateTransaction')) {
        if (err.message.includes('Unknown transaction input (missing from UTxO set)')) {
          throw new UTxOContentionError()
        }
        throw new ScriptExecutionError()
      }
      if (err.message.includes('Your wallet does not have enough funds to cover the required assets')) {
        throw new BalanceTooLowError()
      }
    }
    throw err
  }
}

const tokenSchema = z.enum(['DJED', 'SHEN']).openapi({ example: 'DJED' })
export type TokenType = z.infer<typeof tokenSchema>

const actionSchema = z.enum(['Mint', 'Burn']).openapi({ example: 'Mint' })
export type ActionType = z.infer<typeof actionSchema>

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
    cacheMiddleware,
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
      try {
        const [lucid, oracleUTxO, poolUTxO, now] = await Promise.all([
          getLucid(),
          getOracleUTxO(),
          getPoolUTxO(),
          getChainTime(),
        ])
        const param = c.req.valid('param')
        console.log('Param: ', param)
        const amount = BigInt(Math.round(Number(param.amount) * 1e6))
        if (amount < 0n) {
          throw new BadRequestError('Quantity must be positive number.')
        }
        const json = c.req.valid('json')
        console.log('Json: ', json)
        let address

        try {
          address = CML.Address.from_hex(json.hexAddress).to_bech32()
        } catch {
          throw new ValidationError('Invalid Cardano address format.')
        }
        lucid.selectWallet.fromAddress(
          address,
          json.utxosCborHex.map((cborHex) => coreToUtxo(CML.TransactionUnspentOutput.from_cbor_hex(cborHex))),
        )
        const config = {
          lucid,
          registry,
          amount,
          address,
          oracleUTxO,
          poolUTxO,
          orderMintingPolicyRefUTxO: registry.orderMintingPolicyRefUTxO,
          now,
        }
        const tx = await completeTransaction(
          param.token === 'DJED'
            ? param.action === 'Mint'
              ? () => createMintDjedOrder(config)
              : () => createBurnDjedOrder(config)
            : param.action === 'Mint'
              ? () => createMintShenOrder(config)
              : () => createBurnShenOrder(config),
        )
        const txCbor = tx.toCBOR()
        console.log('Tx CBOR: ', txCbor)
        const txHash = tx.toHash()
        console.log('Tx hash: ', txHash)
        return c.text(txCbor)
      } catch (err) {
        if (err instanceof AppError) {
          console.error(`${err.name}: ${err.message}`)
          return c.json({ error: err.name, message: err.message }, err.status)
        }
        console.error('Unhandled error:', err)
        return c.json({ error: 'InternalServerError', message: 'Something went wrong.' }, 500)
      }
    },
  )
  .post(
    '/orders',
    cacheMiddleware,
    describeRoute({
      description: 'Get the orders UTxOs',
      tags: ['Action'],
      responses: {
        200: {
          description: 'Successfully got the orders UTxOs',
          content: {
            'text/plain': {
              example: 'UTxO',
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
    zValidator('json', txRequestBodySchema),
    async (c) => {
      let json

      try {
        json = c.req.valid('json')
        if (!json?.hexAddress) {
          throw new ValidationError('Missing hexAddress in request.')
        }
      } catch (e) {
        console.error('Invalid or missing request payload.', e)
        throw new ValidationError('Invalid or missing request payload.')
      }

      let address: string
      try {
        address = CML.Address.from_hex(json.hexAddress).to_bech32()
      } catch (e) {
        console.error('Invalid Cardano address format.', e)
        throw new ValidationError('Invalid Cardano address format.')
      }

      console.log('hexAddr: ', json.hexAddress)
      console.log('utxosCborHex: ', json.utxosCborHex)
      console.log('Address: ', address)

      try {
        const allOrders = await getOrderUTxOs()
        console.log('AllOrders: ', allOrders)

        //const filteredOrders = allOrders.filter((o) => o.address === address);

        const sanitizedOrders = allOrders.map((o) => ({
          ...o,
          assets: Object.fromEntries(Object.entries(o.assets).map(([k, v]) => [k, (v as bigint).toString()])),
          orderDatum: {
            ...o.orderDatum,
            creationDate: o.orderDatum.creationDate.toString(),
            adaUSDExchangeRate: {
              numerator: o.orderDatum.adaUSDExchangeRate.numerator.toString(),
              denominator: o.orderDatum.adaUSDExchangeRate.denominator.toString(),
            },
            actionFields:
              'MintDJED' in o.orderDatum.actionFields
                ? {
                    MintDJED: {
                      djedAmount: o.orderDatum.actionFields.MintDJED.djedAmount.toString(),
                      adaAmount: o.orderDatum.actionFields.MintDJED.adaAmount.toString(),
                    },
                  }
                : Object.fromEntries(
                    Object.entries(o.orderDatum.actionFields).map(([key, value]) => [
                      key,
                      Object.fromEntries(
                        Object.entries(value).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]),
                      ),
                    ]),
                  ),
          },
        }))

        return c.json({ orders: sanitizedOrders })
      } catch (err) {
        if (err instanceof AppError) {
          throw err
        }

        console.error('Unhandled error in orders endpoint:', err)
        throw new InternalServerError()
      }
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
