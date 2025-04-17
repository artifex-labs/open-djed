import * as _CML from '@anastasia-labs/cardano-multiplatform-lib-browser'
import { Blockfrost, Lucid } from "@lucid-evolution/lucid"
import { registryByNetwork } from "@reverse-djed/txs"
import { Hono } from 'hono'
import { env } from "./env"

const app = new Hono()

const registry = registryByNetwork[env.VITE_NETWORK]

app.get('/', (c) => c.text(`Hello Cardano ${env.VITE_NETWORK} network!`))

app.get('/pool-utxo', async (c) => {
  const lucid = await Lucid(new Blockfrost(env.VITE_BLOCKFROST_URL, env.VITE_BLOCKFROST_PROJECT_ID), env.VITE_NETWORK)

  const poolUTxO = await lucid.utxoByUnit(registry.poolAssetId)
  return c.text(`Pool UTxO has ref, ${poolUTxO.txHash}#${poolUTxO.outputIndex}.`)
})

export default app