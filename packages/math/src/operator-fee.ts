import { maxBigInt, minBigInt } from "./bigint";
import { Rational, type RationalFields } from "./rational";

export const operatorFee = (adaAmount: bigint | RationalFields, minOperatorFee: bigint, maxOperatorFee: bigint, operatorFeePercentage: Rational): bigint => maxBigInt(
  minOperatorFee,
  minBigInt(
    operatorFeePercentage
      .mul(adaAmount)
      .ceil()
      .toBigInt(),
    maxOperatorFee
  )
)