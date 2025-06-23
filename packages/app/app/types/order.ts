export type ActionFields =
  | { MintDJED: { djedAmount: bigint; adaAmount: bigint } }
  | { BurnDJED: { djedAmount: bigint } }
  | { MintSHEN: { shenAmount: bigint; adaAmount: bigint } }
  | { BurnSHEN: { shenAmount: bigint } }

export type OrderDatum = {
  actionFields: ActionFields
  address: string
  adaUSDExchangeRate: { numerator: bigint; denominator: bigint }
  creationDate: bigint
  orderStateTokenMintingPolicyId: string
}

export type Order = {
  txHash: string
  outputIndex: number
  assets: Record<string, bigint>
  orderDatum: OrderDatum
}
