type LoadingCircleProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const sizeMap: Record<NonNullable<LoadingCircleProps['size']>, string> = {
  sm: 'size-7',
  md: 'size-10',
  lg: 'size-14',
  xl: 'size-20',
  '2xl': 'size-28',
}

export const LoadingCircle = ({ size = 'sm' }: LoadingCircleProps) => {
  const sizeClass = sizeMap[size]

  return (
    <svg
      className={`animate-spin text-primary ${sizeClass}`}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base full circle - static with low opacity */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.2" />
      {/* Partial arc - spinning with full color */}
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}
