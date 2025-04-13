import { expect, test } from "vitest"
import { adaInReserve, reserveRatio } from "./reserve"
import { Rational } from "./rational"

test('adaInReserve', () => {
  expect(adaInReserve({
    adaInReserve: 31240837671805n,
  })).toEqual(31240837671805n)
})

test('reserveRatio', () => {
  expect(reserveRatio({
    adaInReserve: 31240837671805n,
    djedInCirculation: 3041800103658n,
    shenInCirculation: 23950207971999n,
  }, {
    oracleFields: {
      adaUSDExchangeRate: {
        numerator: 63479n,
        denominator: 100000n,
      }
    }
  })).toEqual({
    numerator: 1983137134568509595n,
    denominator: 304180010365800000n,
  })
})