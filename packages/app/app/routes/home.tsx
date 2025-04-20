import { hc } from 'hono/client'
import type { AppType } from '@reverse-djed/api'
import type { Route } from './+types/home'
import { useQuery } from '@tanstack/react-query'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Reverse DJED' }, { name: 'description', content: 'Welcome to reverse DJED!' }]
}

export function loader() {
  return {}
}

const TokenDetails = ({ token }: { token: 'DJED' | 'SHEN' }) => {
  const client = hc<AppType>('http://localhost:3002')
  const { isPending, error, data } = useQuery({
    queryKey: ['protocol-data'],
    queryFn: () => client.api['protocol-data'].$get().then((r) => r.json()),
  })
  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <span className="font-black">{token}</span>
      <br />
      <div className="flex justify-between">
        <span>Buy price</span>
        <span>{data[token].buy_price.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Sell price</span>
        <span>{data[token].sell_price.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Circulating supply</span>
        <span>{data[token].circulating_supply.toFixed(4)} DJED</span>
      </div>
      <div className="flex justify-between">
        <span>Mintable amount</span>
        <span>{data[token].mintable_amount.toFixed(4)} DJED</span>
      </div>
    </div>
  )
}

export default function Home() {
  const client = hc<AppType>('http://localhost:3002')
  const { isPending, error, data } = useQuery({
    queryKey: ['protocol-data'],
    queryFn: () => client.api['protocol-data'].$get().then((r) => r.json()),
  })
  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-1/2 flex-column border-2 border-black rounded-md p-4 m-4">
        <div className="flex flex-row items-center justify-center">
          <TokenDetails token="DJED" />
          <TokenDetails token="SHEN" />
        </div>
        <div className="flex-column border-2 border-black rounded-md p-4 m-4">
          <span className="font-black">Reserve</span>
          <br />
          <div className="flex justify-between">
            <span>Ratio</span>
            <span>{Math.round(data.reserve.ratio * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Value</span>
            <span>{data.reserve.amount.toFixed(4)} ADA</span>
          </div>
        </div>
      </div>
    </div>
  )
}
