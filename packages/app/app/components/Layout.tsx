import { Header } from './Header'
import { WalletProvider } from '../context/WalletContext'
import { EnvContext } from '../context/EnvContext'
import type { Network } from '@reverse-djed/txs'

type Props = {
  children: React.ReactNode
  apiUrl: string
  network: Network
  config: Record<string, string>
}

export function Layout({ children, apiUrl, network, config }: Props) {
  return (
    <EnvContext.Provider value={{ apiUrl, network, config }}>
      <WalletProvider>
        <Header />
        {children}
      </WalletProvider>
    </EnvContext.Provider>
  )
}
