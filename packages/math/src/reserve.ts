import type { PoolDatum } from "@reverse-djed/data";
import { Rational } from "./rational";
import { djedADARate, type PartialOracleDatum, type PartialPoolDatum } from "./rate";

export const adaInReserve = ({ adaInReserve }: Pick<PoolDatum, 'adaInReserve'>): bigint =>
  adaInReserve

export const reserveRatio = (poolDatum: PartialPoolDatum, oracleDatum: PartialOracleDatum): Rational =>
  new Rational(adaInReserve(poolDatum)).div(djedADARate(oracleDatum).mul(poolDatum.djedInCirculation))