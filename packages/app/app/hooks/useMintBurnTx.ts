// hooks/useMintBurnTx.ts
import { useApiClient } from '~/context/ApiClientContext'
import { useWallet } from '~/context/WalletContext'
import * as CML from '@dcspark/cardano-multiplatform-lib-browser'

export function useMintBurnTx() {
  const client = useApiClient()
  const { wallet } = useWallet()

  const execute = async ({
    action,
    token,
    amount,
  }: {
    action: 'mint' | 'burn'
    token: 'DJED' | 'SHEN'
    amount: number
  }) => {
    if (!wallet) throw new Error('Wallet not connected')
    const hexAddress = await wallet.getChangeAddress()
    const address = CML.Address.from_hex(hexAddress).to_bech32()
    const utxosCborHex = await wallet.getUtxos()
    if (!utxosCborHex) throw new Error('No UTXOs found')

    const txCbor = await client.api[':token'][':action'][':amount']['tx']
      .$post({ param: { token, action, amount: amount.toString() }, json: { address, utxosCborHex } })
      .then((r) => r.text())

    const signedTx = await wallet.signTx(txCbor, false)
    const txHash = await wallet.submitTx(signedTx)
    return txHash
  }

  return { execute }
}
