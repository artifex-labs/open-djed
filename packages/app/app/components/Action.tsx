import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWallet } from '~/context/WalletContext'
import * as CML from '@dcspark/cardano-multiplatform-lib-browser'
import Button from '~/components/Button'
import { useApiClient } from '~/context/ApiClientContext'

type ActionProps = {
  action: 'mint' | 'burn'
  token: 'DJED' | 'SHEN'
  onActionStart: () => void
  onActionComplete: () => void
}

export const Action = ({ action, token, onActionStart, onActionComplete }: ActionProps) => {
  const [amount, setAmount] = useState<number>(0)
  const client = useApiClient()
  const { wallet } = useWallet()

  const { isPending, error, data } = useQuery({
    queryKey: [token, action, amount, 'data'],
    queryFn: () =>
      client.api[':token'][':action'][':amount']['data']
        .$get({ param: { token, action, amount: amount.toString() } })
        .then((r) => r.json()),
  })

  if (error) return <div>Error: {error.message}</div>

  const handleActionClick = async () => {
    if (!wallet || amount <= 0) return
    onActionStart()

    try {
      const hexAddress = await wallet.getChangeAddress()
      const address = CML.Address.from_hex(hexAddress).to_bech32()
      const utxosCborHex = await wallet.getUtxos()

      if (!utxosCborHex) {
        throw new Error('No UTXOs found')
      }

      const txCbor = await client.api[':token'][':action'][':amount']['tx']
        .$post({ param: { token, action, amount: amount.toString() }, json: { address, utxosCborHex } })
        .then((r) => r.text())

      const signedTx = await wallet.signTx(txCbor, false)
      const txHash = await wallet.submitTx(signedTx)
      console.log('Transaction hash:', txHash)

      onActionComplete()
    } catch (err) {
      console.error('Action failed:', err)
      onActionComplete()
    }
  }

  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <div className="font-bold">{action} {token}</div>
      <div className="flex justify-between">
        <span>Cost</span>
        <span>{isPending ? 'Loading...' : data?.base_cost.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Fees</span>
        <span>{isPending ? 'Loading...' : data?.operator_fee.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>You will pay</span>
        <span>{isPending ? 'Loading...' : data?.cost.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Minimum ADA requirement</span>
        <span>{isPending ? 'Loading...' : data?.min_ada.toFixed(4)} ADA</span>
      </div>

      <input
        className="border-1 border-black w-full my-4"
        type="number"
        value={amount.toString()}
        onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
      />

      <Button
        className="w-full bg-white"
        onClick={handleActionClick}
        disabled={wallet === null || amount <= 0 || isPending}
      >
        {action}
      </Button>
    </div>
  )
}
