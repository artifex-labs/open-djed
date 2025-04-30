import { Header } from './Header'
import { WalletProvider } from '../context/WalletContext'
import { EnvContext } from '../context/EnvContext'
import type { Network } from '~/types/network'

type Props = {
  children: React.ReactNode
  apiUrl: string
  network: Network
  config: any
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
