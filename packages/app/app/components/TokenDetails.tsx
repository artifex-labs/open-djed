import { useProtocolData } from '~/hooks/useProtocolData'
import type { TokenType } from '~/types/token'
import Button from './Button'
import { NavLink } from 'react-router'

type TokenDetailsProps = {
  token: TokenType
  route: string
}

export function TokenDetails({ token, route }: TokenDetailsProps) {
  const { isPending, error, data } = useProtocolData()
  if (error) return <div className="text-red-500 font-bold">ERROR: {error.message}</div>

  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full md:min-w-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 ">{token} Token Details</h2>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-row justify-between">
            <p className="font-medium">Buy Price</p>
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
                  <path
                    
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                data[token].buy_price.toFixed(4)
              )}{' '}
              ADA
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <p className="font-medium">Sell Price</p>
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
                  <path
                    
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                data[token].sell_price.toFixed(4)
              )}{' '}
              ADA
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <p className="font-medium">Circulating Supply</p>
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
                  <path
                    
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                data[token].circulating_supply.toFixed(4)
              )}{' '}
              {token}
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <p className="font-medium">Mintable Amount</p>
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
                  <path
                    
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                data[token].mintable_amount.toFixed(4)
              )}{' '}
              {token}
            </p>
          </div>
        </div>

        <NavLink
          to={route}
          className="w-full text-white font-bold bg-primary hover:bg-primary-hover cursor-pointer transition-opacity px-4 py-2 rounded-lg flex items-center justify-center"
        >
          Mint/Burn
        </NavLink>
      </div>
    </div>
  )
}
