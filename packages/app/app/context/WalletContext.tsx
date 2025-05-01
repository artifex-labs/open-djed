import { createContext, useContext, useState } from 'react'
import type { WalletApi } from '@lucid-evolution/lucid'
import { decode } from 'cbor2'
import { useEnv } from './EnvContext'

type WalletMetadata = {
  id: string
  name: string
  icon: string
}

type WalletContextType = {
  wallet: WalletApi | null
  balance: number
  wallets: WalletMetadata[]
  // eslint-disable-next-line no-unused-vars
  connect: (id: string) => Promise<void>
  detectWallets: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('WalletContext not found')
  return ctx
}

const networkIds = {
  Preprod: 0,
  Mainnet: 1,
} as const

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletApi | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const { network } = useEnv()

  const detectWallets = () => {
    if (typeof window === 'undefined') return

    const detected = Object.keys(window.cardano || {})
      .filter((id) => window.cardano[id].icon)
      .map((id) => {
        const prov = window.cardano[id]!
        return {
          id,
          name: prov.name,
          icon: prov.icon,
        }
      })

    setWallets(detected)
  }

  const connect = async (id: string) => {
    try {
      const api = await window.cardano[id].enable()

      if ((await api.getNetworkId()) !== networkIds[network]) {
        alert(`Please connect to a ${network} wallet`)
        return
      }

      setWallet(api)

      const balance = decode<number>(await api.getBalance()) / 10 ** 6
      setBalance(balance)
    } catch (err) {
      console.error(`Failed to enable ${id}`, err)
    }
  }

  return (
    <WalletContext.Provider value={{ wallet, balance, wallets, connect, detectWallets }}>
      {children}
    </WalletContext.Provider>
  )
}
