import { useState } from 'react'
import { useWallet } from '~/context/WalletContext'
import Button from '~/components/Button'
import { useApiClient } from '~/context/ApiClientContext'
import { useProtocolData, type Value } from '~/hooks/useProtocolData'
import { registryByNetwork } from '@reverse-djed/registry'
import { AmountInput } from '~/components/AmountInput'
import type { ActionType, TokenType } from '@reverse-djed/api'
import { useEnv } from '~/context/EnvContext'
import Toast from './Toast'
import { LoadingCircle } from './LoadingCircle'
import { formatNumber } from '~/utils'
import { Rational } from '@reverse-djed/math'

type ActionProps = {
  action: ActionType
  token: TokenType
  onActionStart: () => void
  onActionComplete: () => void
}

const VALUE_KEYS = ['ADA', 'DJED', 'SHEN']

const formatValue = (value: Value) => {
  const filteredValue = Object.entries(value).filter(([, v]) => v && v > 0)
  if (filteredValue.length === 0) return `0 ADA`
  return filteredValue
    .sort((a, b) => VALUE_KEYS.indexOf(a[0]) - VALUE_KEYS.indexOf(b[0]))
    .map(([k, v]) => `${formatNumber(v.toFixed(4))} ${k}`)
    .join(' ')
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
      const address = await wallet.address()

      const txCbor = await client.api[':token'][':action'][':amount']['tx']
        .$post({
          param: { token, action, amount: amount.toString() },
          json: { hexAddress: address, utxosCborHex: utxos },
        })
        .then((r) => r.text())

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

      setToastProps({ message: `Transaction failed. Please try again.`, type: 'error', show: true })
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
  const registry = registryByNetwork[network]
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full md:min-w-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {action} {token}
      </h2>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Base cost</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  The base value to pay without fees.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.baseCost ?? {})}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{action} fee</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Fee paid to the pool and distributed to SHEN holders when they burn tokens. Calculated as{' '}
                  {actionData?.actionFeePercentage ?? '-'}% of the base cost.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.actionFee ?? {})}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Operator fee</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Fee paid to the COTI treasury for order processing. Calculated as{' '}
                  {registry.operatorFeeConfig.percentage.toNumber() * 100}% of the sum of base cost
                  {actionData ? ` (${formatValue(actionData?.baseCost)})` : ''} and action fee
                  {actionData ? ` (${formatValue(actionData?.actionFee)})` : ''}, with a minimum of{' '}
                  {new Rational({
                    numerator: registry.operatorFeeConfig.min,
                    denominator: 1_000_000n,
                  }).toNumber()}{' '}
                  ADA and maximum of {Number(registry.operatorFeeConfig.max) * 1e-6} ADA.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <LoadingCircle />
            ) : actionData ? (
              formatNumber(actionData?.operatorFee.toFixed(4))
            ) : (
              '-'
            )}{' '}
            ADA
          </p>
        </div>
        <hr className="my-2 w-100 self-center border-gray-600" />
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Total cost</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  The sum of the base cost{actionData ? ` (${formatValue(actionData?.baseCost)})` : ''},
                  action fee{actionData ? ` (${formatValue(actionData?.actionFee)})` : ''} and operator fee
                  {actionData ? ` (${formatNumber(actionData.operatorFee.toFixed(4))} ADA)` : ''}.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.totalCost ?? {})}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Refundable deposit</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Amount of ADA a user must send in order to create a order. This value is refunded when the
                  order is processed or cancelled.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : protocolData?.refundableDeposit} ADA
          </p>
        </div>
        <hr className="my-2 w-100 self-center border-gray-600" />
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will send</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Sum of total cost {actionData ? `(${formatValue(actionData?.totalCost)})` : ''} and
                  refundable deposit{protocolData ? ` (${protocolData.refundableDeposit} ADA)` : ''}.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.toSend ?? {})}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will receive</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Sum of the desired amount and the refundable deposit.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <LoadingCircle />
            ) : (
              `${action === 'Burn' ? '~' : ''}${formatValue(actionData?.toReceive ?? {})}`
            )}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Price</p>
            <div className="tooltip">
              <div className="tooltip-content">
                <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">
                  Final price (in ADA per {token}) after fees.
                </div>
              </div>
              <i className="fa-solid fa-circle-info pt-1"></i>
            </div>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <LoadingCircle />
            ) : (
              `${action === 'Burn' ? '~' : ''}${actionData && Number.isFinite(actionData.price) ? formatNumber(actionData.price) : '0'} ADA/${token}`
            )}
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
