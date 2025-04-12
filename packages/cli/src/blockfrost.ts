import { Blockfrost, type RedeemerTag } from "@lucid-evolution/lucid"
import {
  type EvalRedeemer,
  type Transaction,
  type UTxO,
} from "@lucid-evolution/core-types"
import packageJson from "../package.json" with { type: "json" }

export class MyBlockfrost extends Blockfrost {
  constructor(url: string, projectId?: string) {
    super(url, projectId)
  }

  async evaluateTx(
    tx: Transaction,
    additionalUTxOs?: UTxO[], // for tx chaining
  ): Promise<EvalRedeemer[]> {
    console.log(tx)
    console.log(additionalUTxOs)
    const payload = {
      cbor: tx,
      additionalUtxoSet: [],
    }

    const res = await fetch(`${this.url}/utils/txs/evaluate/utxos?version=6`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        project_id: this.projectId,
        lucid,
      },
      body: JSON.stringify(payload),
    }).then((res) => res.json() as { fault?: unknown, status_code?: number, message?: string, })
    if (!res || res.fault) {
      const message =
        res?.status_code === 400
          ? res.message
          : `Could not evaluate the transaction: ${JSON.stringify(res)}. Transaction: ${tx}`
      throw new Error(message)
    }
    const blockfrostRedeemer = res as BlockfrostRedeemer
    if (!("EvaluationResult" in blockfrostRedeemer.result)) {
      throw new Error(
        `EvaluateTransaction fails: ${JSON.stringify(blockfrostRedeemer.result)}`,
      )
    }
    const evalRedeemers: EvalRedeemer[] = []
    Object.entries(blockfrostRedeemer.result.EvaluationResult).forEach(
      ([redeemerPointer, data]) => {
        const [pTag, pIndex] = redeemerPointer.split(":")
        evalRedeemers.push({
          redeemer_tag: fromLegacyRedeemerTag(
            pTag as LegacyRedeemerTag,
          ),
          redeemer_index: Number(pIndex),
          ex_units: { mem: Number(data.memory), steps: Number(data.steps) },
        })
      },
    )

    return evalRedeemers
  }
}

type BlockfrostRedeemer = {
  result:
  | {
    EvaluationResult: {
      [key: string]: {
        memory: number
        steps: number
      }
    }
  }
  | {
    CannotCreateEvaluationContext: any
  }
}

const lucid = packageJson.version // Lucid version

export type LegacyRedeemerTag = "spend" | "mint" | "certificate" | "withdrawal"

export const fromLegacyRedeemerTag = (
  redeemerTag: LegacyRedeemerTag,
): RedeemerTag => {
  switch (redeemerTag) {
    case "certificate":
      return "publish"
    case "withdrawal":
      return "withdraw"
    default:
      return redeemerTag
  }
}