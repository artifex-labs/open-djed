import { formatNumber } from '~/utils'
import Tooltip from './Tooltip'

interface ReserveRatioGraphProps {
  currentRatio: number
  minRatio: number
  maxRatio: number
}

export function ReserveRatioGraph({ currentRatio, minRatio, maxRatio }: ReserveRatioGraphProps) {
  const reserves = [
    {
      label: 'Min',
      value: minRatio,
      position: 'top-full mt-10',
      style: 'w-1 h-5 bg-black dark:bg-white',
    },
    {
      label: 'Max',
      value: maxRatio,
      position: 'top-full mt-10',
      style: 'w-1 h-5 bg-black dark:bg-white',
    },
    {
      label: 'Current',
      value: currentRatio,
      position: 'bottom-full mb-12',
      style:
        'w-5 h-5 rounded-full border-2 border-black bg-white dark:bg-black dark:border-white hover:shadow-lg transition-shadow',
    },
  ]

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="relative w-full h-6 rounded-lg overflow-visible">
        <div className="absolute top-1/2 left-0 w-full h-3 bg-white dark:bg-gray-900 rounded-lg transform -translate-y-1/2 z-0 shadow-inner" />

        <div className="absolute top-1/2 left-0 h-3 w-full flex overflow-hidden z-10 -translate-y-1/2 rounded-lg">
          <div
            className="bg-amber-500 rounded-l-lg transition-all duration-300 ease-in-out"
            style={{ width: `${(minRatio / 10) * 100}%` }}
          />
          <div
            className="bg-emerald-800 transition-all duration-300 ease-in-out"
            style={{ width: `${((maxRatio - minRatio) / 10) * 100}%` }}
          />
          <div
            className="bg-amber-500 rounded-r-lg transition-all duration-300 ease-in-out"
            style={{ width: `${100 - (maxRatio / 10) * 100}%` }}
          />
        </div>

        {reserves.map(({ label, value, position, style }, index) => (
          <div key={index}>
            <div
              className="absolute z-20 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
              style={{ left: `${(value / 10) * 100}%` }}
            >
              <div className={style} />
            </div>
            <div
              className="absolute z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all duration-300 ease-in-out"
              style={{ left: `${(value / 10) * 100}%` }}
            >
              <div
                className={`text-xs font-semibold text-black dark:text-white ${position} hover:scale-110 transition-transform`}
              >
                <Tooltip text={`${formatNumber(Math.round(value * 100), { minimumFractionDigits: 0 })}%`}>
                  {label}
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
