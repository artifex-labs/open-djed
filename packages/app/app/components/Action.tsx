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
    .map(([k, v]) => `${v.toFixed(4)} ${k}`)
    .join(', ')
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
  return (
    <div className="bg-light-foreground dark:bg-dark-foreground shadow-md rounded-xl p-4 md:p-6 w-full md:min-w-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {action} {token}
      </h2>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Base cost</p>
            <i className="fa-solid fa-circle-info pt-1" title={`The base value to pay without fees.`}></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.baseCost)}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">{action} fee</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title={`The ${action.toLocaleLowerCase()} fee is ${actionData?.actionFeePercentage ?? '-'} % of the base cost.`}
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.actionFee)}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Operator fee</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title={`The operator fee is calculated using the formula min(max(0.25% * (baseCost + actionFee), 5 ADA), 25 ADA).`}
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : actionData?.operatorFee} ADA
          </p>
        </div>
        ---
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Total cost</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title={`The sum of the base cost ${actionData ? `(${formatValue(actionData?.baseCost)})` : ''}, action fee ${actionData ? `(${formatValue(actionData?.actionFee)})` : ''} and operator fee ${actionData ? `(${actionData?.operatorFee} ADA)` : ''}.`}
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.totalCost)}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">Refundable deposit</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title="Amount of ADA a user must send in order to create a order. This value is refunded when the order is processed or cancelled."
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : protocolData?.refundableDeposit} ADA
          </p>
        </div>
        ---
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will send</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title={`Sum of total cost ${actionData ? `(${formatValue(actionData?.totalCost)})` : ''} and refundable deposit${protocolData ? ` (${protocolData.refundableDeposit} ADA)` : ''}.`}
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? <LoadingCircle /> : formatValue(actionData?.toSend)}
          </p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row space-x-4">
            <p className="font-medium">You will receive</p>
            <i
              className="fa-solid fa-circle-info pt-1"
              title="Sum of the desired amount and the refundable deposit."
            ></i>
          </div>
          <p className="text-lg flex justify-center items-center">
            {isPending ? (
              <LoadingCircle />
            ) : (
              `${action === 'Burn' ? '~' : ''}${formatValue(actionData?.toReceive)}`
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
