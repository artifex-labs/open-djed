import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWallet } from '~/context/WalletContext'
import Button from '~/components/Button'
import { useApiClient } from '~/context/ApiClientContext'
import type { ActionType } from '~/types/action'
import type { TokenType } from '~/types/token'
import { useProtocolData } from '~/hooks/useProtocolData'
import { registryByNetwork } from '@reverse-djed/registry'

type ActionProps = {
  action: ActionType
  token: TokenType
  onActionStart: () => void
  onActionComplete: () => void
}

export const Action = ({ action, token, onActionStart, onActionComplete }: ActionProps) => {
  const [amount, setAmount] = useState<number>(0)
  const client = useApiClient()
  const { wallet } = useWallet()

  const { isPending: isProtocolDataPending, error: protocolError, data: protocolData } = useProtocolData()

  const {
    isPending: isActionDataPending,
    error: actionError,
    data: actionData,
  } = useQuery({
    queryKey: [token, action, amount, 'data'],
    queryFn: () =>
      client.api[':token'][':action'][':amount']['data']
        .$get({ param: { token, action, amount: amount.toString() } })
        .then((r) => r.json()),
  })

  if (protocolError) return <div className="text-red-500 font-bold">Error: {protocolError.message}</div>
  if (actionError) return <div className="text-red-500 font-bold">Error: {actionError.message}</div>

  const handleActionClick = async () => {
    if (!wallet || amount <= 0) return
    onActionStart()

    try {
      if (!wallet.utxos) {
        throw new Error('No UTXOs found')
      }

      const txCbor = await client.api[':token'][':action'][':amount']['tx']
        .$post({
          param: { token, action, amount: amount.toString() },
          json: { hexAddress: wallet.address, utxosCborHex: wallet.utxos },
        })
        .then((r) => r.text())

      const signedTx = await wallet.signTx(txCbor)
      const txHash = await wallet.submitTx(signedTx)
      console.log('Transaction hash:', txHash)

      onActionComplete()
    } catch (err) {
      console.error('Action failed:', err)
      onActionComplete()
    }
  }

  // FIXME: This is not perfect yet.
  const balance =
    Math.round(
      Math.min(
        Math.max(
          (action === 'burn'
            ? wallet?.balance[token]
            : ((wallet?.balance.ADA ?? 0) -
                Number(registryByNetwork['Mainnet'].operatorFeeConfig.max) / 1e6) /
              (protocolData ? protocolData[token].buy_price : 0)) ?? 0,
          0,
        ),
        (action === 'mint' ? protocolData?.[token].mintable_amount : protocolData?.[token].burnable_amount) ??
          0,
      ) * 1e6,
    ) / 1e6
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full md:min-w-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {action.replace(/^\w/, (c) => c.toUpperCase())} {token}
      </h2>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between">
          <p className="font-medium">Cost</p>
          <p className="text-lg flex justify-center items-center">
            {isActionDataPending ? (
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
              actionData?.base_cost.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">Fees</p>
          <p className="text-lg flex justify-center items-center">
            {isActionDataPending ? (
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
              actionData?.operator_fee.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">You will pay</p>
          <p className="text-lg flex justify-center items-center">
            {isActionDataPending ? (
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
              actionData?.cost.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">Minimum ADA requirement</p>
          <p className="text-lg flex justify-center items-center">
            {isActionDataPending ? (
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
              actionData?.min_ada.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <input
            className="border-2 border-primary rounded-md px-4 py-2 text-lg w-full focus:outline-none"
            type="number"
            min="0"
            value={amount.toString()}
            onChange={(e) => setAmount(Math.max(0, Math.min(Number(e.target.value), balance)))}
            placeholder="Enter amount"
          />
          <p className="text-xs text-right pt-1 pr-1">Available: {isProtocolDataPending ? 0 : balance}</p>
        </div>

        <Button
          className="w-full"
          onClick={handleActionClick}
          disabled={wallet === null || amount <= 0 || isActionDataPending || isProtocolDataPending}
        >
          {action.replace(/^\w/, (c) => c.toUpperCase())}
        </Button>
      </div>
    </div>
  )
}
