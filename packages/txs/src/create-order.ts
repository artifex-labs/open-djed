import { Data, type LucidEvolution, type UTxO } from "@lucid-evolution/lucid"
import type { Registry } from "./registry"
import type { OracleUTxO, PoolUTxO } from "./types"
import { OrderMintRedeemer, PoolDatum } from "@reverse-djed/data"

export type CreateOrderConfig = {
  lucid: LucidEvolution
  registry: Registry
  address: string
  oracleUTxO: OracleUTxO
  poolUTxO: PoolUTxO
  orderMintingPolicyRefUTxO: UTxO
  now: number
}

export const createOrder = ({
  lucid,
  registry,
  address,
  oracleUTxO,
  poolUTxO,
  orderMintingPolicyRefUTxO,
  now,
}: CreateOrderConfig) => {
  return lucid
    .newTx()
    .readFrom([oracleUTxO, poolUTxO, orderMintingPolicyRefUTxO])
    .validFrom(now)
    .validTo(now + registry.validityLength)
    .addSigner(address)
    .mintAssets(
      {
        [registry.orderAssetId]: 1n,
      },
      OrderMintRedeemer,
    )
    .pay.ToAddressWithData(address, { kind: 'asHash', value: Data.to(poolUTxO.poolDatum, PoolDatum) }, {})
}
