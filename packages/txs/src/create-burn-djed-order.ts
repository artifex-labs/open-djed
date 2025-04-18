import { Data, fromUnit } from '@lucid-evolution/lucid'
import { OrderDatum, fromBech32 } from '@reverse-djed/data'
import { djedADABurnRate, operatorFee } from '@reverse-djed/math'
import { createOrder, type CreateOrderConfig } from './create-order'

export const createBurnDjedOrder = (config: {
  amount: bigint
} & CreateOrderConfig) =>
  createOrder(config).pay.ToContract(
    config.registry.orderAddress,
    {
      kind: 'inline',
      value: Data.to(
        {
          actionFields: {
            BurnDJED: {
              djedAmount: config.amount,
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
        config.poolUTxO.poolDatum.minADA +
        operatorFee(
          djedADABurnRate(config.oracleUTxO.oracleDatum, config.registry.burnDJEDFeePercentage).mul(config.amount),
          config.registry.operatorFeeConfig,
        ),
      [config.registry.djedAssetId]: config.amount,
    },
  )