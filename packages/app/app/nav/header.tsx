import type { WalletApi } from '@lucid-evolution/lucid'
import { decode } from 'cbor2'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Modal from '~/components/Modal'
import { useEnv } from '~/root'

type WalletMetadata = {
  id: string
  name: string
  icon: string
}

const networkIds = {
  Preprod: 0,
  Mainnet: 1,
} as const

export const Header = ({
  setWallet,
  wallet,
}: {
  setWallet: (wallet: WalletApi) => void
  wallet: WalletApi | null
}) => {
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const [isOpen, setOpen] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const { network, config } = useEnv()

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
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
  }, [isOpen])

  const connect = async (id: string) => {
    try {
      const api = await window.cardano[id].enable()
      setWallet(api)
      setOpen(false)

      const balance = decode<number>(await api.getBalance()) / 10 ** 6
      setBalance(balance)

      if ((await api.getNetworkId()) !== networkIds[network]) {
        alert(`Please connect to ${network} network`)
      }
    } catch (err) {
      console.error(`Failed to enable ${id}`, err)
    }
  }

  return (
    <header className="flex items-center justify-between py-4 px-4">
      <div className="flex items-center">
        <Link to="/">
          <div className="text-xl flex items-center">
            <img src="/reverse-djed.svg" alt="Reverse DJED" />
            Reverse DJED
          </div>
        </Link>
        <select
          className="ml-4 p-2 border rounded"
          value={network}
          onChange={(e) => {
            window.location.href = config[e.target.value]
          }}
        >
          {Object.keys(config).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <nav className="absolute left-1/2 transform -translate-x-1/2">
        <ul className="flex items-center">
          <li className="m-3">
            <NavLink to="/">Home</NavLink>
          </li>
          <li className="m-3">
            <NavLink to="/djed">DJED</NavLink>
          </li>
          <li className="m-3">
            <NavLink to="/shen">SHEN</NavLink>
          </li>
        </ul>
      </nav>
      <Button onClick={() => setOpen(true)} className="w-48">
        {wallet ? `${balance}$` : 'Connect your wallet'}
      </Button>
      <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Select Wallet">
        <div className="grid gap-4">
          {wallets.length === 0 && <p>No wallets detected.</p>}
          {wallets.map(({ id, name, icon }) => (
            <button
              key={id}
              onClick={() => connect(id)}
              className="flex items-center p-3 border rounded hover:bg-gray-100"
            >
              <img src={icon} alt={`${name} icon`} className="w-8 h-8 mr-3" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </header>
  )
}
