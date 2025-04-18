import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    ADDRESS: z.string().optional(),
    SEED: z.string().optional(),
    NETWORK: z.enum(['Mainnet', 'Preprod']).default('Preprod'),
  },
  clientPrefix: '',
  runtimeEnv: process.env,
})
