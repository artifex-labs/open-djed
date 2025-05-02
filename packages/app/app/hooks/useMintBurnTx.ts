import { useApiClient } from '~/context/ApiClientContext'
import { useWallet } from '~/context/WalletContext'
import type { TokenType } from '~/types/token'
import type { ActionType } from '~/types/action'

export function useMintBurnTx() {
  const client = useApiClient()
  const { wallet } = useWallet()

  const execute = async ({
    action,
    token,
    amount,
  }: {
    action: ActionType
    token: TokenType
    amount: number
  }) => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!wallet.utxos) throw new Error('No UTXOs found')

    const txCbor = await client.api[':token'][':action'][':amount']['tx']
      .$post({
        param: { token, action, amount: amount.toString() },
        json: { hexAddress: wallet.address, utxosCborHex: wallet.utxos },
      })
      .then((r) => r.text())

    const signedTx = await wallet.signTx(txCbor)
    const txHash = await wallet.submitTx(signedTx)
    return txHash
  }

  return { execute }
}
