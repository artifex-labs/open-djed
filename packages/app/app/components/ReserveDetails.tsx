import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { LoadingCircle } from './LoadingCircle'
import { ReserveRatioGraph } from './ReserveRatioGraph'
import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  const currentRatio = data?.protocolData.reserve.ratio ?? 0
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-6">Reserve Details</h2>

      <div className="flex flex-col gap-2">
        <ReserveRatioGraph
          currentRatio={currentRatio}
          minRatio={minReserveRatio.toNumber()}
          maxRatio={maxReserveRatio.toNumber()}
        />

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
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
