import type { Network } from '@reverse-djed/txs'

export type LoaderData = {
  apiUrl: string
  network: Network
  config: Record<string, string>
  initialIsDark: 'dark' | 'light' | null;
}
