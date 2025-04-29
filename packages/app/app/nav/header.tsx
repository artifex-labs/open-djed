import type { WalletApi } from '@lucid-evolution/lucid'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Menu, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)
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
    <header className="z-30 w-full sticky top-0 py-4 px-4">
      <nav className="flex items-center justify-between">
      
        {/* Left - Logo */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold">
            <img src="/reverse-djed.svg" alt="Reverse DJED" className="w-8 h-8" />
            <span>Reverse DJED</span>
          </Link>
        </div>

        {/* Center - Nav Links (desktop only) */}
        <div className="hidden md:flex justify-center space-x-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/djed">DJED</NavLink>
          <NavLink to="/shen">SHEN</NavLink>
        </div>

        {/* Right - Select and Wallet (desktop) */}
        <div className="flex-1 hidden md:flex justify-end items-center space-x-4">
          <Select
            defaultValue={network}
            size="md"
            onChange={(e) => {
              window.location.href = config[e.target.value]
            }}
            options={Object.keys(config).map((key) => ({
              value: key,
              label: key,
            }))}
          />
          <Button onClick={() => setOpen(true)} className="w-48">
            {walletApi ? `${balance}$` : 'Connect your wallet'}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="flex flex-col items-center md:hidden mt-4 space-y-4">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/djed" onClick={() => setMenuOpen(false)}>DJED</NavLink>
          <NavLink to="/shen" onClick={() => setMenuOpen(false)}>SHEN</NavLink>
          <Select
            defaultValue={network}
            size="md"
            onChange={(e) => {
              window.location.href = config[e.target.value]
            }}
            options={Object.keys(config).map((key) => ({
              value: key,
              label: key,
            }))}
          />
          <Button onClick={() => { setOpen(true); setMenuOpen(false) }} className="w-full">
            {walletApi ? `${balance}$` : 'Connect your wallet'}
          </Button>
        </div>
      )}

      {/* Wallet Modal */}
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
