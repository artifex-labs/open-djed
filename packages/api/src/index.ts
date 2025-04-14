import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
// import { OracleDatum, OrderDatum, PoolDatum } from "@reverse-djed/data"
// import { registryByNetwork } from '@reverse-djed/txs'
// import { Blockfrost, Data, Lucid, type UTxO } from "@lucid-evolution/lucid"
// import { djedADABurnRate, djedADAMintRate, reserveRatio, shenADABurnRate, shenADAMintRate } from "@reverse-djed/math"
// 
// export type PoolUTxO = UTxO & { poolDatum: PoolDatum }
// export type OracleUTxO = UTxO & { oracleDatum: OracleDatum }
// export type OrderUTxO = UTxO & { orderDatum: OrderDatum }
// 
// export type TokenData = {
//   buyPrice: number
//   sellPrice: number
//   circulatingSupply: number
//   mintableAmount: number
// }
// 
// export type Token = 'DJED' | 'SHEN'
// 
// export type AppData = {
//   utxos: {
//     poolUTxO: PoolUTxO
//     oracleUTxO: OracleUTxO
//     orderUTxOs: OrderUTxO[]
//   }
//   tokenData: Record<Token, TokenData>
//   reserve: {
//     ratio: number
//     value: number
//   }
// }
// 
// export const network = 'Mainnet'
// 
// const blockfrostProjectIdByNetwork = {
//   Mainnet: 'mainnet6nn5cOiVycGeknLTOBNbmw1fgTeoQWfo',
//   Preprod: 'preprodmAhR2Rq99LM1WGxB9DXVS2WOILme1hZF',
// }
// 
// const blockfrostProjectId = blockfrostProjectIdByNetwork[network]
// 
// export const lucid = await Lucid(new Blockfrost(`https://cardano-${network.toLocaleLowerCase()}.blockfrost.io/api/v0`, blockfrostProjectId), network)
// 
// const registry = registryByNetwork[network]
// 
// const poolUTxO = await lucid.utxoByUnit(registry.poolAssetId).then(async poolUTxO => {
//   const poolDatumCbor = poolUTxO.datum ?? Data.to(await lucid.datumOf(poolUTxO))
//   const poolDatum = Data.from(poolDatumCbor, PoolDatum)
//   return { ...poolUTxO, poolDatum }
// })
// const oracleUTxO = await lucid.utxoByUnit(registry.adaUsdOracleAssetId).then(async oracleUTxO => {
//   const oracleDatumCbor = oracleUTxO.datum ?? Data.to(await lucid.datumOf(oracleUTxO))
//   const oracleDatum = Data.from(oracleDatumCbor, OracleDatum)
//   return { ...oracleUTxO, oracleDatum }
// })
// const orderUTxOs = await lucid.utxosAtWithUnit(registry.orderAddress, registry.orderAssetId)
//   .then(orderUTxOs =>
//     Promise.all(orderUTxOs.map(async (orderUTxO) => {
//       const orderDatumCbor = orderUTxO.datum ?? Data.to(await lucid.datumOf(orderUTxO))
//       return { ...orderUTxO, orderDatum: Data.from(orderDatumCbor, OrderDatum) }
//     })))
// 
// export const appData: AppData = {
//   utxos: {
//     poolUTxO,
//     oracleUTxO,
//     orderUTxOs,
//   },
//   tokenData: {
//     DJED: {
//       buyPrice: djedADAMintRate(oracleUTxO.oracleDatum, registry.mintDJEDFee).toNumber(),
//       sellPrice: djedADABurnRate(oracleUTxO.oracleDatum, registry.burnDJEDFee).toNumber(),
//       circulatingSupply: Number(poolUTxO.poolDatum.djedInCirculation) / 1e6,
//       mintableAmount: 0,
//     },
//     SHEN: {
//       buyPrice: shenADAMintRate(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.mintSHENFee).toNumber(),
//       sellPrice: shenADABurnRate(poolUTxO.poolDatum, oracleUTxO.oracleDatum, registry.burnSHENFee).toNumber(),
//       circulatingSupply: Number(poolUTxO.poolDatum.shenInCirculation) / 1e6,
//       mintableAmount: 0,
//     },
//   },
//   reserve: {
//     value: Number(poolUTxO.poolDatum.adaInReserve) / 1e6,
//     ratio: reserveRatio(poolUTxO.poolDatum, oracleUTxO.oracleDatum).toNumber(),
//   },
// }
