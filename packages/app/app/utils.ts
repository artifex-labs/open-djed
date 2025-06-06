export function formatNumber(
  value: number,
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 6,
  }).format(value)
}

export const DEFAULT_SHOW_BALANCE = true
