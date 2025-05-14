import { useState } from 'react'
import { useWallet } from '~/context/WalletContext'
import Button from '~/components/Button'
import { useApiClient } from '~/context/ApiClientContext'
import { useProtocolData } from '~/hooks/useProtocolData'
import { registryByNetwork } from '@reverse-djed/registry'
import { AmountInput } from '~/components/AmountInput'
import type { ActionType, TokenType } from '@reverse-djed/api'

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

  const { isPending, error, data } = useProtocolData()
  const protocolData = data?.protocolData
  const actionData = data?.tokenActionData(token, action, amount)

  if (error) return <div className="text-red-500 font-bold">Error: {error.message}</div>

  const handleActionClick = async () => {
    if (!wallet || amount <= 0) return
    onActionStart()

    try {
      const utxos = await wallet.utxos()
      if (!utxos) throw new Error('No UTXOs found')
      const address = await wallet.address()

      const txCbor = await client.api[':token'][':action'][':amount']['tx']
        .$post({
          param: { token, action, amount: amount.toString() },
          json: { hexAddress: address, utxosCborHex: utxos },
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
          (action === 'Burn'
            ? wallet?.balance[token]
            : ((wallet?.balance.ADA ?? 0) -
                Number(registryByNetwork['Mainnet'].operatorFeeConfig.max) / 1e6) /
              (protocolData ? protocolData[token].buyPrice : 0)) ?? 0,
          0,
        ),
        (action === 'Mint' ? protocolData?.[token].mintableAmount : protocolData?.[token].burnableAmount) ??
          0,
      ) * 1e6,
    ) / 1e6
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full md:min-w-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {action} {token}
      </h2>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between">
          <p className="font-medium">Cost</p>
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
              actionData?.baseCost.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">Operator fees</p>
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
              actionData?.operatorFee.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">{action} fees</p>
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
              ((actionData?.actionFeePercentage ?? 0) * 100).toFixed(1)
            )}{' '}
            %
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">You will pay</p>
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
              actionData?.cost.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>

        <div className="flex justify-between">
          <p className="font-medium">Minimum ADA</p>
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
              protocolData?.minADA.toFixed(4)
            )}{' '}
            ADA
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AmountInput
          value={amount}
          onChange={setAmount}
          max={balance}
          min={50}
          step={1}
          unit={token}
          disabled={wallet === null || isPending}
        />

        <Button
          className="w-full"
          onClick={handleActionClick}
          disabled={wallet === null || amount <= 0 || isPending || amount > balance}
        >
          {action.replace(/^\w/, (c) => c.toUpperCase())}
        </Button>
      </div>
    </div>
  )
}
