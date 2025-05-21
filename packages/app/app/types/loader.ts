import type { Network } from '@reverse-djed/registry'

export type LoaderData = {
  apiUrl: string
  network: Network
  config: Record<string, string>
  initialIsDark: 'dark' | 'light' | null
  posthog: {
    url: string
    key: string
  }
}
