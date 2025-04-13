import type { PoolDatum } from "@reverse-djed/data";
import { Rational } from "./rational";
import { djedADARate, type PartialOracleDatum, type PartialPoolDatum } from "./rate";

export const adaInReserve = ({ adaInReserve }: Pick<PoolDatum, 'adaInReserve'>): bigint =>
  adaInReserve

export const reserveRatio = (poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): Rational =>
  new Rational(adaInReserve(poolDatum)).div(djedADARate(oracleDatum).mul(poolDatum.djedInCirculation))

// Ratio of ADA in reserve to DJED in circulation over which SHEN is no longer mintable. Not sure if this is configurable.
export const maxReserveRatio = 8

// Ratio of ADA in reserve to DJED in circulation under which DJED is no longer mintable. Not sure if this is configurable.
export const minReserveRatio = 4