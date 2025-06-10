import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'
import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { LoadingCircle } from './LoadingCircle'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-6">Reserve Details</h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p className="font-medium">Min Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center text-right">
            {minReserveRatio.toNumber() * 100}%
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Max Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center text-right">
            {maxReserveRatio.toNumber() * 100}%
          </p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center text-right">
            {isPending ? <LoadingCircle /> : formatNumber(Math.round(data.protocolData.reserve.ratio * 100))}%
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center text-right">
              {isPending ? <LoadingCircle /> : formatValue(data.protocolData.reserve.amount)}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(data.protocolData.reserve.amount), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
