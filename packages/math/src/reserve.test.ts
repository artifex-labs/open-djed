import { expect, test } from "vitest"
import { adaInReserve, maxMintableDJED, reserveRatio } from "./reserve"
import { registryByNetwork } from "@reverse-djed/txs"

test('adaInReserve', () => {
  expect(adaInReserve({
    adaInReserve: 31240837671805n,
  })).toEqual({ numerator: 31240837671805n, denominator: 1n, })
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

test('maxMintableDJED', () => {
  expect(maxMintableDJED({
    adaInReserve: 31220582824526n,
    djedInCirculation: 3049627686600n,
    shenInCirculation: 23920207971999n,
  },
    {
      oracleFields: {
        adaUSDExchangeRate: {
          numerator: 6271n,
          denominator: 10000n,
        }
      }
    },
    registryByNetwork['Mainnet'].mintDJEDFeePercentage)
  ).toEqual(2472333917206n)
})