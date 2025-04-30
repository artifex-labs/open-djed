import { useProtocolData } from "~/hooks/useProtocolData";
import type { TokenType } from "~/types/token";


type TokenDetailsProps = {
  token: TokenType;
}

export function TokenDetails({
  token,
}: TokenDetailsProps) {
    const { isPending, error, data } = useProtocolData()
  if (!data) return <div>No data available</div>

  return (
    <div className="flex flex-col border-2 border-black rounded-md p-4 m-4 w-full max-w-xs">
      <span className="font-black text-xl mb-2">{token}</span>

      <div className="flex justify-between">
        <span>Buy price</span>
        <span>{isPending ? 'Loading...' : data[token].buy_price.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Sell price</span>
        <span>{isPending ? 'Loading...' : data[token].sell_price.toFixed(4)} ADA</span>
      </div>
      <div className="flex justify-between">
        <span>Circulating supply</span>
        <span>{isPending ? 'Loading...' : data[token].circulating_supply.toFixed(4)} {token}</span>
      </div>
      <div className="flex justify-between">
        <span>Mintable amount</span>
        <span>{isPending ? 'Loading...' : data[token].mintable_amount.toFixed(4)} {token}</span>
      </div>
    </div>
  )
}
