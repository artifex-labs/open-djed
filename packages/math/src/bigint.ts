export const absBigInt = (n: bigint): bigint => (n < 0n ? -n : n)

export const maxBigInt = (a: bigint, b: bigint): bigint => (a < b ? b : a)

export const minBigInt = (a: bigint, b: bigint): bigint => (a < b ? a : b)
