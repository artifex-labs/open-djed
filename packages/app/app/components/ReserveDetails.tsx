import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'
import { useProtocolData } from '~/hooks/useProtocolData'
import { formatNumber, formatValue, type Value } from '~/utils'
import { LoadingCircle } from './LoadingCircle'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  const currentRatio = data?.protocolData.reserve.ratio ?? 0
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-6">Reserve Details</h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 mb-4">
          <p className="font-medium">Reserve Ratio</p>

          <div className="relative w-full h-3 rounded-lg overflow-visible">
            <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-900 rounded-lg z-0" />

            <div className="absolute top-0 left-0 h-full w-full flex overflow-hidden z-10">
              <div
                style={{
                  width: `${(minReserveRatio.toNumber() / 10) * 100}%`,
                  background: 'linear-gradient(to right, #7f1d1d, #991b1b, #b91c1c)',
                  borderTopLeftRadius: '0.5rem',
                  borderBottomLeftRadius: '0.5rem',
                }}
                className="h-full"
              />
              <div
                style={{
                  width: `${((maxReserveRatio.toNumber() - minReserveRatio.toNumber()) / 10) * 100}%`,
                  background: `
                    linear-gradient(
                      to right,
                      #14532d,
                      #16a34a,
                      #4ade80,
                      #16a34a,
                      #14532d
                    )
                  `,
                }}
                className="h-full"
              />
              <div
                style={{
                  width: `${100 - (minReserveRatio.toNumber() / 10) * 100 - ((maxReserveRatio.toNumber() - minReserveRatio.toNumber()) / 10) * 100}%`,
                  background: 'linear-gradient(to right, #b91c1c, #991b1b, #7f1d1d)',
                  borderTopRightRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem',
                }}
                className="h-full"
              />
            </div>

            <div
              className="absolute text-[10px] font-semibold text-black dark:text-white bottom-full z-30 text-center group"
              style={{
                left: `${(currentRatio / 10) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              Current
              <div className="mb-1 hidden group-hover:block absolute bottom-full bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {formatNumber(Math.round(currentRatio * 100), { minimumFractionDigits: 0, })}%
              </div>
            </div>
            <div
              className="absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-30"
              style={{
                left: `${(currentRatio / 10) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-black z-20"
              style={{ left: `${(minReserveRatio.toNumber() / 10) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-black z-20"
              style={{ left: `${(maxReserveRatio.toNumber() / 10) * 100}%` }}
            />

            <div
              className="absolute top-4 text-[10px] font-semibold text-black dark:text-white z-30 text-center group"
              style={{
                left: `${(minReserveRatio.toNumber() / 10) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              Min
              <div className="mt-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {formatNumber(Math.round(minReserveRatio.toNumber() * 100), { minimumFractionDigits: 0, })}%
              </div>
            </div>

            <div
              className="absolute top-4 text-[10px] font-semibold text-black dark:text-white z-30 text-center group"
              style={{
                left: `${(maxReserveRatio.toNumber() / 10) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              Max
              <div className="mt-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {formatNumber(Math.round(maxReserveRatio.toNumber() * 100), { minimumFractionDigits: 0, })}%
              </div>
            </div>
          </div>
        </div>

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
