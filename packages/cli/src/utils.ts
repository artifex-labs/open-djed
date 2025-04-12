import type { OutRef } from "@lucid-evolution/lucid"

export const parseOutRef = (outRefStr: string): OutRef => {
  const txOutRef = outRefStr.match(
    // In words, a txOutRef starts with 64 hex characters, followed by '#',
    // followed by up to 2 digits, then ends.
    /^(?<txHash>[a-f0-9]{64})#(?<index>\d{1,2})$/,
  )

  if (!txOutRef?.groups?.txHash || !txOutRef?.groups?.index) {
    throw new Error(`Expected a txOutRef in <tx-hash>#<index> format, got: "${outRefStr}"`)
  }

  return { txHash: txOutRef.groups.txHash, outputIndex: Number(txOutRef.groups.index) }
}