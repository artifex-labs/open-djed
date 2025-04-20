import * as _CML from '@anastasia-labs/cardano-multiplatform-lib-browser'
import { Blockfrost, Lucid } from '@lucid-evolution/lucid'
import { registryByNetwork } from '@reverse-djed/txs'
import { Hono } from 'hono'
import { env } from './env'

const app = new Hono()

app.get('/api/:token/:action/:quantity/data', (c) => {
  return c.json({
    base_cost: 0,
    operator_fee: 0,
    cost: 0,
    min_ada: 0,
  })
})

app.get('/api/:token/:action/:quantity/tx', (c) => {
  // deconstruct body, which should be a json object with the following fields:
  // - address: string
  // - utxos: string[]
  return c.text('<cbor-here>')
})

app.get('/api/protocol_data', (c) => {
  return c.json({
    djed: {
      buy_price: 0,
      sell_price: 0,
      circulating_supply: 0,
      mintable_amount: 0,
    },
    shen: {
      buy_price: 0,
      sell_price: 0,
      circulating_supply: 0,
      mintable_amount: 0,
    },
    reserve: {
      amount: 0,
      ratio: 0,
    },
  })
})

app.get('/api/orders', (c) => {
  return c.json([])
})

app.get('/api/cancel-order-tx/:order_out_ref', (c) => {
  // deconstruct body, which should be a json object with the following fields:
  // - address: string
  // - utxos: string[]
  return c.text('<cbor-here>')
})

export default app
