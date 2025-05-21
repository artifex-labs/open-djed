import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { Header } from './Header'
import { WalletProvider } from '../context/WalletContext'
import { EnvContext } from '../context/EnvContext'
import Footer from './Footer'
import type { Network } from '@reverse-djed/registry'

type Props = {
  children: React.ReactNode
  apiUrl: string
  network: Network
  config: Record<string, string>
  posthogApiKey: string
}

export function Layout({ children, apiUrl, network, config, posthogApiKey }: Props) {
  posthog.init(posthogApiKey, { api_host: 'https://eu.i.posthog.com' })
  return (
    <EnvContext.Provider value={{ apiUrl, network, config, initialIsDark: null, posthogApiKey }}>
      <PostHogProvider client={posthog}>
        <WalletProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletProvider>
      </PostHogProvider>
    </EnvContext.Provider>
  )
}
