import type { PoolDatum } from "@reverse-djed/data";
import { Rational, type RationalFields } from "./rational";
import { djedADARate, type PartialOracleDatum, type PartialPoolDatum } from "./rate";
import { maxBigInt } from "./bigint";

export const adaInReserve = ({ adaInReserve }: Pick<PoolDatum, 'adaInReserve'>): Rational =>
  new Rational(adaInReserve)

export const reserveRatio = (poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): Rational =>
  adaInReserve(poolDatum).div(djedADARate(oracleDatum).mul(poolDatum.djedInCirculation))

// Ratio of ADA in reserve to DJED in circulation over which SHEN is no longer mintable.
export const maxReserveRatio = new Rational({
  numerator: 8n,
  denominator: 1n,
})

// Ratio of ADA in reserve to DJED in circulation under which DJED is no longer mintable.
export const minReserveRatio = new Rational({
  numerator: 4n,
  denominator: 1n,
})

export const maxMintableDJED = (poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum, mintDjedFeePercentage: RationalFields): bigint =>
  maxBigInt(
    adaInReserve(poolDatum)
      .sub(
        minReserveRatio
          .mul(poolDatum.djedInCirculation)
          .mul(djedADARate(oracleDatum)
          )
      )
      .div(
        djedADARate(oracleDatum)
          .mul(minReserveRatio.sub(1n).sub(mintDjedFeePercentage))
      )
      .toBigInt(),
    0n,
  )