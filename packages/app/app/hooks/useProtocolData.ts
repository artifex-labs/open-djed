import type { TokenType, ActionType } from '@reverse-djed/api'
import {
  djedADABurnRate,
  djedADAMintRate,
  maxBurnableSHEN,
  maxMintableDJED,
  maxMintableSHEN,
  reserveRatio,
  shenADABurnRate,
  shenADAMintRate,
  operatorFee as getOperatorFee,
  Rational,
  djedADARate,
  shenADARate,
  adaDJEDRate,
  type PartialPoolDatum,
  type PartialOracleDatum,
  adaSHENRate,
} from '@reverse-djed/math'
import { registryByNetwork } from '@reverse-djed/registry'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '~/context/ApiClientContext'
import { useEnv } from '~/context/EnvContext'

export type Value = Partial<Record<'ADA' | 'DJED' | 'SHEN', number>>

const sumValues = (...values: Value[]): Value =>
  values.reduce(
    (acc, value) => ({
      ...acc,
      ...Object.fromEntries(Object.entries(value).map(([k, v]) => [k, v + (acc[k as keyof Value] ?? 0)])),
    }),
    {},
  )

export const toDJED = (value: Value, poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): number =>
  adaDJEDRate(oracleDatum)
    .mul(
      shenADARate(poolDatum, oracleDatum)
        .mul(BigInt(Math.floor((value.SHEN ?? 0) * 1e6)))
        .add(BigInt(Math.floor((value.ADA ?? 0) * 1e6))),
    )
    .div(1_000_000n)
    .toNumber() + (value.DJED ?? 0)

export const toADA = (value: Value, poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): number =>
  shenADARate(poolDatum, oracleDatum)
    .mul(BigInt(Math.floor((value.SHEN ?? 0) * 1e6)))
    .add(djedADARate(oracleDatum).mul(BigInt(Math.floor((value.DJED ?? 0) * 1e6))))
    .div(1_000_000n)
    .toNumber() + (value.ADA ?? 0)

export const toSHEN = (value: Value, poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): number =>
  adaSHENRate(poolDatum, oracleDatum)
    .mul(
      djedADARate(oracleDatum)
        .mul(BigInt(Math.floor((value.DJED ?? 0) * 1e6)))
        .add(BigInt(Math.floor(value.ADA ?? 0) * 1e6)),
    )
    .div(1_000_000n)
    .toNumber() + (value.SHEN ?? 0)

export const to = (
  value: Value,
  poolDatum: PartialPoolDatum,
  oracleDatum: PartialOracleDatum,
  token: 'DJED' | 'SHEN' | 'ADA',
): number =>
  token === 'DJED'
    ? toDJED(value, poolDatum, oracleDatum)
    : token === 'SHEN'
      ? toSHEN(value, poolDatum, oracleDatum)
      : toADA(value, poolDatum, oracleDatum)

export function useProtocolData() {
  const client = useApiClient()
  const { network } = useEnv()
  return useQuery({
    queryKey: ['protocol-data'],
    queryFn: () =>
      client.api['protocol-data'].$get().then(async (r) => {
        const { oracleDatum: serializedOracleDatum, poolDatum: serializedPoolDatum } = await r.json()
        const oracleDatum = {
          oracleFields: {
            adaUSDExchangeRate: {
              numerator: BigInt(serializedOracleDatum.oracleFields.adaUSDExchangeRate.numerator),
              denominator: BigInt(serializedOracleDatum.oracleFields.adaUSDExchangeRate.denominator),
            },
          },
        }
        const poolDatum = {
          djedInCirculation: BigInt(serializedPoolDatum.djedInCirculation),
          shenInCirculation: BigInt(serializedPoolDatum.shenInCirculation),
          adaInReserve: BigInt(serializedPoolDatum.adaInReserve),
          minADA: BigInt(serializedPoolDatum.minADA),
        }
        const registry = registryByNetwork[network]
        const refundableDeposit = Number(poolDatum.minADA) / 1e6
        return {
          protocolData: {
            DJED: {
              buyPrice: djedADAMintRate(oracleDatum, registry.MintDJEDFeePercentage).toNumber(),
              sellPrice: djedADABurnRate(oracleDatum, registry.BurnDJEDFeePercentage).toNumber(),
              circulatingSupply: Number(poolDatum.djedInCirculation) / 1e6,
              mintableAmount:
                Number(maxMintableDJED(poolDatum, oracleDatum, registry.MintDJEDFeePercentage)) / 1e6,
              burnableAmount: Number(poolDatum.djedInCirculation) / 1e6,
            },
            SHEN: {
              buyPrice: shenADAMintRate(poolDatum, oracleDatum, registry.MintSHENFeePercentage).toNumber(),
              sellPrice: shenADABurnRate(poolDatum, oracleDatum, registry.BurnSHENFeePercentage).toNumber(),
              circulatingSupply: Number(poolDatum.shenInCirculation) / 1e6,
              mintableAmount:
                Number(maxMintableSHEN(poolDatum, oracleDatum, registry.MintSHENFeePercentage)) / 1e6,
              burnableAmount:
                Number(maxBurnableSHEN(poolDatum, oracleDatum, registry.MintSHENFeePercentage)) / 1e6,
            },
            reserve: {
              amount: Number(poolDatum.adaInReserve) / 1e6,
              ratio: reserveRatio(poolDatum, oracleDatum).toNumber(),
            },
            refundableDeposit,
          },
          tokenActionData: (
            token: TokenType,
            action: ActionType,
            amount: number,
          ): {
            baseCost: Value
            actionFee: Value
            actionFeePercentage: number
            operatorFee: number
            totalCost: Value
            toSend: Value
            toReceive: Value
            price: number
          } => {
            const actionFeeRatio = new Rational(registry[`${action}${token}FeePercentage`])
            const actionFeePercentage = actionFeeRatio.toNumber() * 100
            const amountBigInt = BigInt(Math.floor(amount * 1e6))
            const exchangeRate =
              token === 'DJED' ? djedADARate(oracleDatum) : shenADARate(poolDatum, oracleDatum)
            if (action === 'Mint') {
              const baseCostRational = exchangeRate.mul(amountBigInt)
              const baseCost = {
                ADA: baseCostRational.div(1_000_000n).toNumber(),
              }
              const actionFeeRational = actionFeeRatio.mul(baseCostRational)
              const actionFee = {
                ADA: actionFeeRational.div(1_000_000n).toNumber(),
              }
              const operatorFee = new Rational(
                getOperatorFee(baseCostRational.add(actionFeeRational), registry.operatorFeeConfig),
              )
                .div(1_000_000n)
                .toNumber()
              const totalCost = sumValues(baseCost, actionFee, { ADA: operatorFee })
              const refundableDepositValue = {
                ADA: refundableDeposit,
              }
              return {
                baseCost,
                actionFee,
                actionFeePercentage: actionFeeRatio.toNumber() * 100,
                operatorFee,
                totalCost,
                toSend: sumValues(totalCost, refundableDepositValue),
                toReceive: sumValues({ [token]: amount }, refundableDepositValue),
                price: toADA(totalCost, poolDatum, oracleDatum) / amount,
              }
            }
            const baseCostRational = actionFeeRatio.add(1n).invert().mul(amountBigInt)
            const baseCost = {
              [token]: baseCostRational.div(1_000_000n).toNumber(),
            }
            const actionFeeRational = baseCostRational.negate().add(amountBigInt)
            const actionFee = {
              [token]: actionFeeRational.div(1_000_000n).toNumber(),
            }
            const operatorFeeBigInt = getOperatorFee(
              baseCostRational.mul(exchangeRate).toBigInt(),
              registry.operatorFeeConfig,
            )
            const operatorFee = new Rational({
              numerator: operatorFeeBigInt,
              denominator: 1_000_000n,
            }).toNumber()
            const totalCost = {
              [token]: baseCostRational.add(actionFeeRational).div(1_000_000n).toNumber(),
              ADA: operatorFee,
            }
            // FIXME: We slightly underestimate this. I don't know why but for now it's ok. Better to underestimate than overestimate.
            const toReceive = {
              ADA: baseCostRational.mul(exchangeRate).div(1_000_000n).toNumber(),
            }
            return {
              baseCost,
              actionFee,
              actionFeePercentage,
              operatorFee,
              totalCost,
              toSend: sumValues(totalCost, {
                ADA: refundableDeposit,
              }),
              toReceive,
              price: toADA(toReceive, poolDatum, oracleDatum) / to(totalCost, poolDatum, oracleDatum, token),
            }
          },
        }
      }),
  })
}
