import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { WalletContext, useApiClient } from '~/root'
import * as CML from '@dcspark/cardano-multiplatform-lib-browser'

const Action = ({ action, token }: { action: 'mint' | 'burn'; token: 'DJED' | 'SHEN' }) => {
  const [amount, setAmount] = useState(0)
  const client = useApiClient()

  const { isPending, error, data } = useQuery({
    queryKey: [token, action, amount, 'data'],
    queryFn: () =>
      client.api[':token'][':action'][':amount']['data']
        .$get({ param: { token, action, amount: amount.toString() } })
        .then((r) => r.json()),
  })
  const wallet = useContext(WalletContext)
  if (error) return <div>Error: {error.message}</div>
  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <span className="font-black">{action}</span>
      <br />
      <div className="flex justify-between">
        <span>Cost</span>
        <span>{isPending ? 'Loading...' : data.base_cost.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Fees</span>
        <span>{isPending ? 'Loading...' : data.operator_fee.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>You will pay</span>
        <span>{isPending ? 'Loading...' : data.cost.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Minimum ADA requirement</span>
        <span>{isPending ? 'Loading...' : data.min_ada.toFixed(4)} ADA</span>
      </div>
      <input
        className="border-1 border-black w-full my-4"
        type="number"
        value={amount.toString()}
        onChange={(i) => setAmount(Math.abs(Number(i.target.value)))}
      ></input>
      <br />
      <button
        className="border-1 border-black rounded-md p-2 w-full font-bold"
        onClick={async () => {
          if (!wallet) return
          const hexAddress = await wallet.getChangeAddress()
          const address = CML.Address.from_hex(hexAddress).to_bech32()
          console.log('address ', address)
          const utxosCborHex = await wallet.getUtxos()
          console.log('utxos cbor hex ', utxosCborHex)
          if (!utxosCborHex) return
          const txCbor = await client.api[':token'][':action'][':amount']['tx']
            .$post({ param: { token, action, amount: amount.toString() }, json: { address, utxosCborHex } })
            .then((r) => r.text())
          console.log('tx cbor ', txCbor)
          const signedTx = await wallet.signTx(txCbor, false)
          console.log('signed tx cbor ', signedTx)
          const txHash = await wallet.submitTx(signedTx)
          console.log('tx hash ', txHash)
        }}
        disabled={wallet === null || amount <= 0}
      >
        {action}
      </button>
    </div>
  )
}

export const Actions = ({ token }: { token: 'DJED' | 'SHEN' }) => {
  return (
    <div className="w-full flex flex-row justify-center items-center">
      <div className="w-1/2 flex flex-row justify-center items-center">
        <Action action="mint" token={token} />
        <Action action="burn" token={token} />
      </div>
    </div>
  )
}
