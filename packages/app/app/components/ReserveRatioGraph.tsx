import { formatNumber } from '~/utils'
import Tooltip from './Tooltip'

interface ReserveRatioGraphProps {
  currentRatio: number
  minRatio: number
  maxRatio: number
}

export function ReserveRatioGraph({ currentRatio, minRatio, maxRatio }: ReserveRatioGraphProps) {
  const reserveLabels = [
    { label: 'Min', value: minRatio, position: 'top-full mt-7' },
    { label: 'Max', value: maxRatio, position: 'top-full mt-7' },
    { label: 'Current', value: currentRatio, position: 'bottom-full mb-8' },
  ]

  const reserveMarkers = [
    {
      value: minRatio,
      style: 'w-0.5 h-3 bg-black',
    },
    {
      value: maxRatio,
      style: 'w-0.5 h-3 bg-black',
    },
    {
      value: currentRatio,
      style: 'w-4 h-4 mt-1.5 rounded-full border-2 bg-white border-black dark:bg-black dark:border-white',
    },
  ]

  return (
    <div className="flex flex-col gap-2 mb-4">
      <p className="font-medium">Reserve Ratio</p>

      <div className="relative w-full h-6 rounded-lg overflow-visible">
        <div className="absolute top-1/2 left-0 w-full h-3 bg-white dark:bg-gray-900 rounded-lg transform -translate-y-1/2 z-0" />

        <div className="absolute top-1/2 left-0 h-3 w-full flex overflow-hidden z-10 transform -translate-y-1/2 rounded-lg">
          <div
            style={{
              width: `${(minRatio / 10) * 100}%`,
              background: 'linear-gradient(to right, #bb9930)',
              borderTopLeftRadius: '0.5rem',
              borderBottomLeftRadius: '0.5rem',
            }}
          />
          <div
            style={{
              width: `${((maxRatio - minRatio) / 10) * 100}%`,
              background: 'linear-gradient(to right, #14532d)',
            }}
          />
          <div
            style={{
              width: `${100 - (maxRatio / 10) * 100}%`,
              background: 'linear-gradient(to right, #bb9930)',
              borderTopRightRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem',
            }}
          />
        </div>

        {/* Labels */}
        {reserveLabels.map(({ label, value, position }) => (
          <div
            key={label}
            className="absolute z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 top-1/2"
            style={{ left: `${(value / 10) * 100}%`}}
          >
            <div className={`text-[10px] font-semibold text-black dark:text-white ${position}`}>
              {label}
            </div>
          </div>
        ))}

        {/* Markers */}
        {reserveMarkers.map(({ value, style }, index) => (
          <div
            key={index}
            className="absolute z-20 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(value / 10) * 100}%` }}
          >
            <Tooltip text={`${formatNumber(Math.round(value * 100), { minimumFractionDigits: 0 })}%`}>
              <div className={style} />
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
