import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { DEFAULT_SHOW_BALANCE, formatNumber } from '~/utils'

type AmountInputProps = {
  value: number
  onChange: (val: number) => void
  max: number
  min?: number
  step?: number
  disabled?: boolean
  unit?: string
}

const roundToDecimals = (value: number, decimals = 6) =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)

export const AmountInput = ({
  value,
  onChange,
  max,
  min = 0,
  step = 0.000001,
  disabled = false,
  unit = 'ADA',
}: AmountInputProps) => {
  const [showBalance] = useLocalStorage<boolean | null>('showBalance', DEFAULT_SHOW_BALANCE)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) {
      onChange(roundToDecimals(parsed))
    } else if (raw === '') {
      onChange(0)
    }
  }

  const handleSet = useCallback(
    (type: 'min' | 'half' | 'max') => {
      const val =
        max <= 0
          ? type === 'min'
            ? min
            : 0
          : type === 'min'
            ? min
            : type === 'half'
              ? Math.max(min, max / 2)
              : max
      onChange(roundToDecimals(val))
    },
    [min, max, onChange],
  )

  const isOverMax = value > max

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div>
          <input
            type="number"
            className={`no-spinner border-2 border-primary rounded-md px-4 py-2 text-lg w-full focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 ${
              isOverMax ? 'text-red-500' : ''
            }`}
            value={value === 0 ? '' : value.toString()}
            step={step}
            min={min}
            max={max}
            onChange={handleInputChange}
            placeholder="Enter amount"
          />{' '}
          {isOverMax && <div className="text-red-500 text-sm mt-1">Amount exceeds available balance</div>}
        </div>
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          {unit}
        </span>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex gap-2 text-sm">
          <button
            className="hover:text-primary disabled:opacity-40"
            onClick={() => handleSet('min')}
            disabled={disabled}
          >
            Min
          </button>
          <span>|</span>
          <button
            className="hover:text-primary disabled:opacity-40"
            onClick={() => handleSet('half')}
            disabled={disabled}
          >
            Half
          </button>
          <span>|</span>
          <button
            className="hover:text-primary disabled:opacity-40"
            onClick={() => handleSet('max')}
            disabled={disabled}
          >
            Max
          </button>
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          Maximum:
          {showBalance ? (
            <span>{formatNumber(roundToDecimals(max))}</span>
          ) : (
            <span className="inline-block w-20 h-1 dark:bg-gray-300 bg-gray-500 rounded-md blur-sm" />
          )}
          {unit}
        </div>
      </div>
    </div>
  )
}
