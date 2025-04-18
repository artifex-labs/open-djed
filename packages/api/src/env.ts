import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    VITE_NETWORK: z.enum(['Mainnet', 'Preprod']),
    VITE_BLOCKFROST_URL: z.string().url(),
    VITE_BLOCKFROST_PROJECT_ID: z.string(),
  },
  clientPrefix: 'VITE_',
  runtimeEnv: process.env,
})
