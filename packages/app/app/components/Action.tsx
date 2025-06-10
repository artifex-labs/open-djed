import { useState } from 'react'
import { useWallet } from '~/context/WalletContext'
import Button from '~/components/Button'
import { useApiClient } from '~/context/ApiClientContext'
import { useProtocolData } from '~/hooks/useProtocolData'
import { registryByNetwork } from '@reverse-djed/registry'
import { AmountInput } from '~/components/AmountInput'
import type { ActionType, TokenType } from '@reverse-djed/api'
import { useEnv } from '~/context/EnvContext'
import Toast from './Toast'
import { LoadingCircle } from './LoadingCircle'
import { formatNumber, formatValue, type Value } from '~/utils'
import { Rational } from '@reverse-djed/math'
import { AppError } from '@reverse-djed/api/src/errors'
import Tooltip from './Tooltip'

type ActionProps = {
  action: ActionType
  token: TokenType
  onActionStart: () => void
  onActionComplete: () => void
}

export const Action = ({ action, token, onActionStart, onActionComplete }: ActionProps) => {
  const [amount, setAmount] = useState<number>(0)
  const [toastProps, setToastProps] = useState<{ message: string; type: 'success' | 'error'; show: boolean }>(
    {
      message: '',
      type: 'success',
      show: false,
    },
  )
  const client = useApiClient()
  const { wallet } = useWallet()

  const { isPending, error, data } = useProtocolData()
  const { network } = useEnv()
  const protocolData = data?.protocolData
  const actionData = data?.tokenActionData(token, action, amount)

  if (error) return <div className="text-red-500 font-bold">Error: {error.message}</div>

  const handleActionClick = async () => {
    //NOTE: This is a workaround to dynamically import the Cardano libraries without causing issues with SSR.
    const { Transaction, TransactionWitnessSet } = await import('@dcspark/cardano-multiplatform-lib-browser')
    if (!wallet || amount <= 0) return
    onActionStart()

    try {
      const utxos = await wallet.utxos()
      if (!utxos) throw new Error('No UTXOs found')
      const address = await wallet.getChangeAddress()

      const response = await client.api[':token'][':action'][':amount']['tx'].$post({
        param: { token, action, amount: amount.toString() },
        json: { hexAddress: address, utxosCborHex: utxos },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new AppError(errorData.message)
      }

      const txCbor = await response.text()

      console.log('Unsigned transaction CBOR: ', txCbor)
      const signature = await wallet.signTx(txCbor)
      console.log('Signature: ', signature)
      const tx = Transaction.from_cbor_hex(txCbor)
      const body = tx.body()
      const witnessSet = tx.witness_set()
      witnessSet.add_all_witnesses(TransactionWitnessSet.from_cbor_hex(signature))
      const signedTxCbor = Transaction.new(body, witnessSet, true).to_cbor_hex()
      console.log('Signed transaction CBOR: ', signedTxCbor)
      const txHash = await wallet.submitTx(signedTxCbor)
      console.log('Transaction hash:', txHash)
      setToastProps({ message: `Transaction submitted: ${txHash}`, type: 'success', show: true })

      onActionComplete()
    } catch (err) {
      console.error('Action failed:', err)
      if (err instanceof AppError) {
        setToastProps({ message: `${err.message}`, type: 'error', show: true })
        onActionComplete()
        return
      }

      setToastProps({ message: `Transaction failed. Please try again.`, type: 'error', show: true })
      onActionComplete()
    }
  }

  const registry = registryByNetwork[network]
  // FIXME: This is not perfect yet.
  const balance =
    Math.round(
      Math.min(
        Math.max(
          (action === 'Burn'
            ? wallet?.balance[token]
            : ((wallet?.balance.ADA ?? 0) -
                (Number(registry.operatorFeeConfig.max) + (protocolData?.refundableDeposit.ADA ?? 1823130)) /
                  1e6) /
              (protocolData ? protocolData[token].buyPrice.ADA : 0)) ?? 0,
          0,
        ),
        (action === 'Mint'
          ? protocolData?.[token].mintableAmount[token]
          : protocolData?.[token].burnableAmount[token]) ?? 0,
      ) * 1e6,
    ) / 1e6
  const toUSD = data ? (value: Value) => data.to(value, 'DJED') : undefined
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">
        {action} {token}
      </h2>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Base cost</p>
            <Tooltip text="The base value to pay without fees." />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(actionData?.baseCost ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(actionData?.baseCost ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{action} fee</p>
            <Tooltip
              text={`
              Fee paid to the pool and distributed to SHEN holders when they burn tokens. 
              Calculated as ${actionData?.actionFeePercentage ?? '-'}% of the base cost.`}
            />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(actionData?.actionFee ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(actionData?.actionFee ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Operator fee</p>
            <Tooltip
              text={`
                Fee paid to the COTI treasury for order processing. Calculated as
                ${registry.operatorFeeConfig.percentage.toNumber() * 100}% of the sum of base cost
                ${actionData ? ` (${formatValue(actionData?.baseCost)})` : ''} and action fee
                ${actionData ? ` (${formatValue(actionData?.actionFee)})` : ''}, with a minimum of
                ${new Rational({
                  numerator: registry.operatorFeeConfig.min,
                  denominator: 1_000_000n,
                }).toNumber()} 
                ADA and maximum of ${Number(registry.operatorFeeConfig.max) * 1e-6} ADA.`}
            />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(actionData?.operatorFee ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(actionData?.operatorFee ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="my-2 w-full px-10">
          <hr className="light-action-line border-light-action-line dark:border-dark-action-line" />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Total cost</p>
            <Tooltip
              text={`
                The sum of the base cost${actionData ? ` (${formatValue(actionData?.baseCost)})` : ''},
                action fee${actionData ? ` (${formatValue(actionData?.actionFee)})` : ''} and operator fee
                ${actionData ? ` (${formatValue(actionData.operatorFee)})` : ''}.`}
            />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(actionData?.totalCost ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(actionData?.totalCost ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Refundable deposit</p>
            <Tooltip
              text={`
                Amount of ADA a user must send in order to create a order. This value is refunded when the
                order is processed or cancelled.`}
            />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(protocolData?.refundableDeposit ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(protocolData?.refundableDeposit ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="my-2 w-full px-10">
          <hr className="light-action-line border-light-action-line dark:border-dark-action-line" />
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will send</p>
            <Tooltip
              text={`
                Sum of total cost ${actionData ? `(${formatValue(actionData.totalCost)})` : ''} and
                refundable deposit${protocolData ? ` (${formatValue(protocolData.refundableDeposit)})` : ''}.`}
            />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? <LoadingCircle /> : formatValue(actionData?.toSend ?? {})}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `$${formatNumber(toUSD(actionData?.toSend ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will receive</p>
            <Tooltip text="Sum of the desired amount and the refundable deposit." />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? (
                  <LoadingCircle />
                ) : (
                  `${action === 'Burn' ? '~' : ''}${formatValue(actionData?.toReceive ?? {})}`
                )}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `${action === 'Burn' ? '~' : ''}$${formatNumber(toUSD(actionData?.toReceive ?? {}), { maximumFractionDigits: 2 })}`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Price</p>
            <Tooltip text={`Final price (in ADA per ${token}) after fees.`} />
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg flex justify-center items-center">
              <p className="text-lg flex justify-center items-center">
                {isPending ? (
                  <LoadingCircle />
                ) : (
                  `${action === 'Burn' ? '~' : ''}${actionData && Number.isFinite(actionData.price.ADA) ? formatValue(actionData.price) : '0 ADA'}/${token}`
                )}
              </p>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              {isPending ? (
                <LoadingCircle />
              ) : toUSD ? (
                `${action === 'Burn' ? '~' : ''}$${actionData && Number.isFinite(actionData.price.ADA) ? formatNumber(toUSD(actionData?.price ?? {}), { maximumFractionDigits: 3 }) : '0'}`
              ) : (
                '-'
              )}
            </p>
          </div>
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
          disabled={
            wallet === null ||
            amount <= 0 ||
            amount < Number(registryByNetwork[network].minAmount) * 1e-6 ||
            isPending ||
            amount > balance
          }
        >
          {action.replace(/^\w/, (c) => c.toUpperCase())}
        </Button>
      </div>
      <Toast
        message={toastProps.message}
        show={toastProps.show}
        onClose={() => setToastProps({ ...toastProps, show: false })}
        type={toastProps.type}
      />
    </div>
  )
}
