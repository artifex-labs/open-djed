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
      position: 'top-full mt-7',
      style: 'w-0.5 h-3 bg-black',
    },
    {
      label: 'Max',
      value: maxRatio,
      position: 'top-full mt-7',
      style: 'w-0.5 h-3 bg-black',
    },
    {
      label: 'Current',
      value: currentRatio,
      position: 'bottom-full mb-8',
      style: 'w-4 h-4 mt-1.5 rounded-full border-2 bg-white border-black dark:bg-black dark:border-white',
    },
  ]

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="relative w-full h-6 rounded-lg overflow-visible">
        <div className="absolute top-1/2 left-0 w-full h-3 bg-white dark:bg-gray-900 rounded-lg transform -translate-y-1/2 z-0" />

        <div className="absolute top-1/2 left-0 h-3 w-full flex overflow-hidden z-10 -translate-y-1/2 rounded-lg">
          <div className="bg-[#bb9930] rounded-l-lg" style={{ width: `${(minRatio / 10) * 100}%` }} />
          <div className="bg-[#14532d]" style={{ width: `${((maxRatio - minRatio) / 10) * 100}%` }} />
          <div className="bg-[#bb9930] rounded-r-lg" style={{ width: `${100 - (maxRatio / 10) * 100}%` }} />
        </div>

        {reserves.map(({ label, value, position, style }, index) => (
          <div key={index}>
            <div
              className="absolute z-20 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(value / 10) * 100}%` }}
            >
              <div className={style} />
            </div>
            <div
              className="absolute z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 top-1/2"
              style={{ left: `${(value / 10) * 100}%` }}
            >
              <div className={`text-[10px] font-semibold text-black dark:text-white ${position}`}>
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
