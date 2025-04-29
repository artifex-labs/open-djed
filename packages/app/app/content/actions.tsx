import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { WalletContext, useApiClient } from '~/root'
import * as CML from '@dcspark/cardano-multiplatform-lib-browser'
import Button from '~/components/Button'

type Order = {
  date: number
  txHash: string
  action: string
  status: string
}

const OrderTable = ({ orders }: { orders: Order[] }) => {
  return (
    <table className="table-auto">
      <thead>
        <tr>
          <th>Date</th>
          <th>Tx hash</th>
          <th>Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.txHash}>
            <td>{new Date(order.date).toLocaleString()}</td>
            <td>{order.txHash}</td>
            <td>{order.action}</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const ActionsPage = ({ token }: { token: 'DJED' | 'SHEN' }) => {
  const client = useApiClient()
  const { isPending, error, data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => client.api['orders'].$get().then((r) => r.json()),
  })
  if (error) return <div>Error: {error.message}</div>
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-1/2 flex-column border-2 border-black rounded-md p-4 m-4">
        <div className="w-full flex flex-row justify-center items-center">
          <div className="w-full flex flex-row justify-center items-center">
            <Action action="mint" token={token} />
            <Action action="burn" token={token} />
          </div>
        </div>
        <div className="flex-column border-2 border-black rounded-md p-4 m-4">
          <span className="font-black">Orders</span><br />
          {isPending
            ? 'Loading...'
            : data.length === 1
              ? 'No orders'
              : <OrderTable orders={[{ date: 1745960389000, txHash: '31b695ff87b9189efa1449586037dabc0e9cdfc6e292d13649f2410f1e1335ff', action: 'mint', status: 'Pending' }]} />
          }
        </div>
      </div>
    </div >
  )
}


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
      <Button
        className="w-full bg-white"
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
      </Button>
    </div>
  )
}