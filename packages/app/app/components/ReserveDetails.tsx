import { maxReserveRatio, minReserveRatio } from '@reverse-djed/math'
import { useProtocolData } from '~/hooks/useProtocolData'

export function ReserveDetails() {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-2 md:p-4 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-6">Reserve Details</h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <p className="font-medium">Min Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">{minReserveRatio.toNumber() * 100}%</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Max Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">{maxReserveRatio.toNumber() * 100}%</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Ratio</p>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <svg
                className="mr-3 size-7 animate-spin text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              Math.round(data.protocolData.reserve.ratio * 100)
            )}
            %
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <p className="font-medium">Reserve Value</p>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <svg
                className="mr-3 size-7 animate-spin text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              data.protocolData.reserve.amount.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>
      </div>
    </div>
  )
}
