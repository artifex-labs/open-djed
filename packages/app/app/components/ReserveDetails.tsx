import { useProtocolData } from '~/hooks/useProtocolData'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div>ERROR: {error.message}</div>

  return (
    <div className="flex flex-col border-2 border-black rounded-md p-4 m-4 w-full max-w-md mx-auto">
      <span className="font-black text-xl mb-2">Reserve</span>

      <div className="flex justify-between">
        <span>Ratio</span>
        <span>{isPending ? 'Loading...' : Math.round(data.reserve.ratio * 100)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Value</span>
        <span>{isPending ? 'Loading...' : data.reserve.amount.toFixed(4)} ADA</span>
      </div>
    </div>
  )
}
