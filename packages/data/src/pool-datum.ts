import { Data } from '@liqwid-labs/lucid'

const PoolDatumSchema = Data.Object({
})
export type PoolDatum = Data.Static<typeof PoolDatumSchema>
export const PoolDatum = PoolDatumSchema as unknown as PoolDatum