import { Header } from './Header'
import { WalletProvider } from '../context/WalletContext'
import { EnvContext } from '../context/EnvContext'
import type { Network } from '@reverse-djed/txs'
import Footer from './Footer'

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
        <div className='flex flex-col min-h-screen'>
          <Header />
          <main className='flex-1'>{children}</main>
          <Footer />
        </div>
      </WalletProvider>
    </EnvContext.Provider>
  )
}
