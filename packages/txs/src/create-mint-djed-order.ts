import { Data, fromUnit } from '@lucid-evolution/lucid'
import { OrderDatum, fromBech32 } from '@reverse-djed/data'
import { djedADAMintRate, operatorFee } from '@reverse-djed/math'
import { createOrder, type CreateOrderConfig } from './create-order'

export const createMintDjedOrder = (config: {
  amount: bigint
} & CreateOrderConfig) => {
  const adaAmountToSend = djedADAMintRate(config.oracleUTxO.oracleDatum, config.registry.mintDJEDFeePercentage)
    .mul(config.amount)
    .ceil()
    .toBigInt()

  return createOrder(config)
    .pay.ToContract(
      config.registry.orderAddress,
      {
        kind: 'inline',
        value: Data.to(
          {
            actionFields: {
              MintDJED: {
                djedAmount: config.amount,
                adaAmount: adaAmountToSend,
              },
            },
            address: fromBech32(config.address),
            adaUSDExchangeRate: config.oracleUTxO.oracleDatum.oracleFields.adaUSDExchangeRate,
            creationDate: BigInt(config.now + config.registry.validityLength),
            orderStateTokenMintingPolicyId: fromUnit(config.registry.orderAssetId).policyId,
          },
          OrderDatum,
        ),
      },
      {
        [config.registry.orderAssetId]: 1n,
        lovelace:
          adaAmountToSend +
          config.poolUTxO.poolDatum.minADA +
          operatorFee(adaAmountToSend, config.registry.operatorFeeConfig),
      },
    )
}
