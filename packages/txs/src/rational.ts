export type RationalFields = {
  numerator: bigint
  denominator: bigint
}

export const mul = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.numerator,
  denominator: a.denominator * b.denominator,
})

export const div = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.denominator,
  denominator: a.denominator * b.numerator,
})

export const sub = (a: RationalFields, b: RationalFields): RationalFields => ({
  numerator: a.numerator * b.denominator - b.numerator * a.denominator,
  denominator: a.denominator * b.denominator,
})

export const fromBigInt = (n: bigint): RationalFields => ({
  numerator: n,
  denominator: 1n,
})

export const toBigInt = (r: RationalFields): bigint => r.numerator / r.denominator

export class Rational implements RationalFields {
  readonly numerator: bigint
  readonly denominator: bigint
  constructor(r: RationalFields | bigint) {
    if (typeof r === 'bigint') {
      this.numerator = r
      this.denominator = 1n
      return
    }
    this.numerator = r.numerator
    this.denominator = r.denominator
  }
  mul(b: RationalFields | bigint): Rational {
    return new Rational(mul(this, typeof b === 'bigint' ? fromBigInt(b) : b))
  }
  div(b: RationalFields | bigint): Rational {
    return new Rational(div(this, typeof b === 'bigint' ? fromBigInt(b) : b))
  }
  sub(b: RationalFields | bigint): Rational {
    return new Rational(sub(this, typeof b === 'bigint' ? fromBigInt(b) : b))
  }
  ceil(): Rational {
    const quotient = this.numerator / this.denominator
    const remainder = this.numerator % this.denominator
    return new Rational({
      numerator: quotient + (remainder > 0n ? 1n : 0n),
      denominator: 1n,
    })
  }
  toBigInt(): bigint {
    return toBigInt(this)
  }
  invert(): Rational {
    return new Rational({ numerator: this.denominator, denominator: this.numerator })
  }
}