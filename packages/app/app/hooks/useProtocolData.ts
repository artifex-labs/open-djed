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
} from '@reverse-djed/math'
import { registryByNetwork } from '@reverse-djed/registry'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '~/context/ApiClientContext'
import { useEnv } from '~/context/EnvContext'

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
        return {
          protocolData: {
            DJED: {
              buyPrice: djedADAMintRate(oracleDatum, registry.mintDJEDFeePercentage).toNumber(),
              sellPrice: djedADABurnRate(oracleDatum, registry.burnDJEDFeePercentage).toNumber(),
              circulatingSupply: Number(poolDatum.djedInCirculation) / 1e6,
              mintableAmount:
                Number(maxMintableDJED(poolDatum, oracleDatum, registry.mintDJEDFeePercentage)) / 1e6,
              burnableAmount: Number(poolDatum.djedInCirculation) / 1e6,
            },
            SHEN: {
              buyPrice: shenADAMintRate(poolDatum, oracleDatum, registry.mintSHENFeePercentage).toNumber(),
              sellPrice: shenADABurnRate(poolDatum, oracleDatum, registry.burnSHENFeePercentage).toNumber(),
              circulatingSupply: Number(poolDatum.shenInCirculation) / 1e6,
              mintableAmount:
                Number(maxMintableSHEN(poolDatum, oracleDatum, registry.mintSHENFeePercentage)) / 1e6,
              burnableAmount:
                Number(maxBurnableSHEN(poolDatum, oracleDatum, registry.mintSHENFeePercentage)) / 1e6,
            },
            reserve: {
              amount: Number(poolDatum.adaInReserve) / 1e6,
              ratio: reserveRatio(poolDatum, oracleDatum).toNumber(),
            },
            minADA: Number(poolDatum.minADA) / 1e6,
          },
          tokenActionData: (token: TokenType, action: ActionType, amountNumber: number) => {
            let actionFeePercentage
            let baseCostRational
            const amount = BigInt(Math.floor(amountNumber * 1e6))
            if (token === 'DJED' && action === 'Mint') {
              actionFeePercentage = new Rational(registry.mintDJEDFeePercentage).toNumber()
              baseCostRational = djedADAMintRate(oracleDatum, registry.mintDJEDFeePercentage).mul(amount)
            } else if (token === 'DJED' && action === 'Burn') {
              actionFeePercentage = new Rational(registry.burnDJEDFeePercentage).toNumber()
              baseCostRational = djedADABurnRate(oracleDatum, registry.burnDJEDFeePercentage).mul(amount)
            } else if (token === 'SHEN' && action === 'Mint') {
              actionFeePercentage = new Rational(registry.mintSHENFeePercentage).toNumber()
              baseCostRational = shenADAMintRate(poolDatum, oracleDatum, registry.mintSHENFeePercentage).mul(
                amount,
              )
            } else {
              actionFeePercentage = new Rational(registry.burnSHENFeePercentage).toNumber()
              baseCostRational = shenADABurnRate(poolDatum, oracleDatum, registry.burnSHENFeePercentage).mul(
                amount,
              )
            }
            const baseCost = baseCostRational.div(BigInt(1e6)).toNumber()
            const operatorFee = Number(getOperatorFee(baseCostRational, registry.operatorFeeConfig)) / 1e6
            return {
              baseCost,
              actionFeePercentage,
              // NOTE: Need to figure out how to share code between this and txs.
              operatorFee,
              cost: baseCost + operatorFee,
            }
          },
        }
      }),
  })
}
