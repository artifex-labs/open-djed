import type { WalletApi } from '@lucid-evolution/lucid'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Select from '~/components/Select'
import Modal from '~/components/Modal'
import { useEnv } from '~/root'
import { Menu, X } from 'lucide-react'

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

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  // Close the menu automatically on desktop (screen width greater than 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false)  // Close the menu when screen size is large enough (desktop)
      }
    }

    // Listen for resize events
    window.addEventListener('resize', handleResize)

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <header>
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow z-50">
        <nav className="flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/" className="flex items-center space-x-2 text-xl font-semibold">
              <img src="/reverse-djed.svg" alt="Reverse DJED" className="w-8 h-8" />
              <span>Reverse DJED</span>
            </Link>
          </div>

          {/* Center links - Desktop only */}
          <div className="hidden md:flex justify-center space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/djed">DJED</NavLink>
            <NavLink to="/shen">SHEN</NavLink>
          </div>

          {/* Right - Wallet & Select */}
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

          {/* Menu toggle - Mobile only */}
          <div className="md:hidden">
            <button onClick={toggleMenu}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Slide-out Mobile Menu */}
      <div className={`fixed right-0 h-full w-3/4 max-w-xs bg-white z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col px-6 py-6 space-y-6">
          <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
          <NavLink to="/djed" onClick={toggleMenu}>DJED</NavLink>
          <NavLink to="/shen" onClick={toggleMenu}>SHEN</NavLink>
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
          <Button onClick={() => { setOpen(true); toggleMenu() }} className="w-full">
            {walletApi ? `${balance}$` : 'Connect your wallet'}
          </Button>
        </div>
      </div>

      {/* Dark background*/}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.77)] z-30"
          onClick={toggleMenu}
        />
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
