import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { Skeleton } from './Skeleton'
import { SkeletonWrapper } from './SkeletonWrapper'
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
        <p className="font-medium">Reserve Ratio</p>
        {isPending ? (
          <Skeleton width="w-full" height="h-3" />
        ) : (
          <ReserveRatioGraph
            currentRatio={currentRatio}
            minRatio={minReserveRatio.toNumber()}
            maxRatio={maxReserveRatio.toNumber()}
          />
        )}

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <SkeletonWrapper isPending={isPending}>
            <p className="text-lg">{data ? formatValue(data.protocolData.reserve.amount) : '-'}</p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {toUSD
                ? data
                  ? `$${formatNumber(toUSD(data.protocolData.reserve.amount), { maximumFractionDigits: 2 })}`
                  : '-'
                : '-'}
            </p>
          </SkeletonWrapper>
        </div>
      </div>
    </div>
  )
}
