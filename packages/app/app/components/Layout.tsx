import { Header } from './Header'
import { WalletProvider } from '../context/WalletContext'
import { EnvContext } from '../context/EnvContext'

type Props = {
  children: React.ReactNode
  apiUrl: string
  network: 'Preprod' | 'Mainnet'
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
