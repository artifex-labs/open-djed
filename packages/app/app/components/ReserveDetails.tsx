import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'
import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { Skeleton } from './Skeleton'
import { SkeletonWrapper } from './SkeletonWrapper'

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
          <p className={`text-lg flex ${isPending ? '' : 'items-center justify-center text-right'}`}>
            {isPending ? (
              <Skeleton width="w-36" />
            ) : (
              `${formatNumber(Math.round(data.protocolData.reserve.ratio * 100))}%`
            )}
          </p>
        </div>

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
