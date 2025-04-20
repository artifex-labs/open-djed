import type { AppType } from '@reverse-djed/api'
import { useState } from 'react'
import { hc } from 'hono/client'
import { useQuery } from '@tanstack/react-query'

const Action = ({ action, token }: { action: 'mint' | 'burn'; token: 'DJED' | 'SHEN' }) => {
  const [amount, setAmount] = useState(0)
  const client = hc<AppType>('http://localhost:3002')
  const { isPending, error, data } = useQuery({
    queryKey: [token, action, amount, 'data'],
    queryFn: () =>
      client.api[':token'][':action'][':amount']['data']
        .$get({ param: { token, action, amount: amount.toString() } })
        .then((r) => r.json()),
  })
  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <span className="font-black">{action}</span>
      <br />
      <div className="flex justify-between">
        <span>Cost</span>
        <span>{data.base_cost.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Fees</span>
        <span>{data.operator_fee.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>You will pay</span>
        <span>{data.cost.toFixed(4)}</span>
      </div>
      <div className="flex justify-between">
        <span>Minimum ADA requirement</span>
        <span>{data.min_ada.toFixed(4)} ADA</span>
      </div>
      <input
        className="border-1 border-black w-full my-4"
        type="number"
        value={amount}
        onChange={(i) => setAmount(Number(i.target.value))}
      ></input>
      <br />
      <button className="border-1 border-black rounded-md p-2 w-full font-bold">{action}</button>
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
