import { operatorFee, shenADABurnRate } from '@reverse-djed/math'
import { Data, fromUnit } from '@lucid-evolution/lucid'
import { OrderDatum, fromBech32 } from '@reverse-djed/data'
import { createOrder, type CreateOrderConfig } from './create-order'

export const createBurnShenOrder = (config: {
  amount: bigint
} & CreateOrderConfig) =>
  createOrder(config).pay.ToContract(
    config.registry.orderAddress,
    {
      kind: 'inline',
      value: Data.to(
        {
          actionFields: {
            BurnSHEN: {
              shenAmount: config.amount,
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
          shenADABurnRate(config.poolUTxO.poolDatum, config.oracleUTxO.oracleDatum, config.registry.burnSHENFeePercentage).mul(
            config.amount,
          ),
          config.registry.operatorFeeConfig,
        ),
      [config.registry.shenAssetId]: config.amount,
    },
  )
