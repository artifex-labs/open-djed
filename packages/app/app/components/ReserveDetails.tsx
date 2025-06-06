import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'
import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue } from '~/utils'
import { LoadingCircle } from './LoadingCircle'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-6">Reserve Details</h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p className="font-medium">Min Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">{minReserveRatio.toNumber() * 100}%</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Max Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">{maxReserveRatio.toNumber() * 100}%</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatNumber(Math.round(data.protocolData.reserve.ratio * 100))}%
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(data.protocolData.reserve.amount)}
          </p>
        </div>
      </div>
    </div>
  )
}
