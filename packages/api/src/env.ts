import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NETWORK: z.enum(['Mainnet', 'Preprod']),
    BLOCKFROST_URL: z.string().url(),
    BLOCKFROST_PROJECT_ID: z.string(),
  },
  isServer: true,
  runtimeEnv: process.env
})