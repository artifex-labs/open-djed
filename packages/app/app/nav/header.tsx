import type { WalletApi } from '@lucid-evolution/lucid'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Select from '~/components/Select'
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

export const Header = () => {
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const [isOpen, setOpen] = useState(false)
  const [walletApi, setWalletApi] = useState<WalletApi | null>(null)
  const [balance, setBalance] = useState<string>('')
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
      setWalletApi(api)
      setOpen(false)

      const balance = await api.getBalance()
      setBalance(balance)

      if ((await api.getNetworkId()) !== networkIds[network]) {
        alert(`Please connect to ${network} network`)
      }
    } catch (err) {
      console.error(`Failed to enable ${id}`, err)
    }
  }

  return (
    <header className="py-4 px-4">
      <nav className="flex items-center">
        <div className="flex-1">
          <Link to="/">
            <div className="align-left text-xl flex flex-column">
              <img src="/reverse-djed.svg" alt="Reverse DJED" />
              Reverse DJED
            </div>
          </Link>
        
        </div>
        <div className="flex-1 flex justify-center">
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
        </div>
        <div className="flex flex-1 justify-end space-x-4">
          <Select
            defaultValue={network}
            size='md'
            onChange={(e) => {
              window.location.href = config[e.target.value]
            }}
            options={Object.keys(config).map((key) => ({
              value: key,
              label: key,
            }))}>
          </Select>
          <Button onClick={() => setOpen(true)} className="w-48">
            {walletApi ? `${balance}$` : 'Connect your wallet'}
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
        </div>
      </nav>
    </header>
  )
}
