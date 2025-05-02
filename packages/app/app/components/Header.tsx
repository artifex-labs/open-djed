import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Modal from '~/components/Modal'
import { useEnv } from '~/context/EnvContext'
import { useWallet } from '~/context/WalletContext'
import { ThemeToggle } from './ThemeToggle'

export const Header = () => {
  const [isOpen, setOpen] = useState(false)
  const { network, config } = useEnv()
  const { wallet, wallets, connect, detectWallets } = useWallet()

  useEffect(() => {
    if (isOpen) detectWallets()
  }, [isOpen])

  return (
    <header className="flex flex-row items-center justify-between py-4 px-8 border-b border-light-foreground dark:border-dark-foreground">
      <div className="flex flex-row items-center justify-center gap-2">
        <Link to="/">
          <div className="flex flex-row text-xl items-center">
            <img src="/reverse-djed.svg" alt="Reverse DJED" />
            Яeverse DJED
          </div>
        </Link>
        <select
          className="ml-4 py-2 px-4 border-2 rounded-lg bg-light-bg dark:bg-dark-bg border-primary focus:outline-none"
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
          <li className="m-3 px-3 py-1.5 rounded-lg transition font-semibold">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'text-primary font-bold' : 'hover:text-primary')}
            >
              Home
            </NavLink>
          </li>
          <li className="m-3 px-3 py-1.5 rounded-lg transition font-semibold">
            <NavLink
              to="/djed"
              className={({ isActive }) => (isActive ? 'text-primary font-bold' : 'hover:text-primary')}
            >
              DJED
            </NavLink>
          </li>
          <li className="m-3 px-3 py-1.5 rounded-lg transition font-semibold">
            <NavLink
              to="/shen"
              className={({ isActive }) => (isActive ? 'text-primary font-bold' : 'hover:text-primary')}
            >
              SHEN
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="flex flex-row items-center justify-center gap-4">
        <ThemeToggle />
        <Button onClick={() => setOpen(true)} className="w-48">
          {wallet ? `${wallet.balance.ADA} ADA` : 'Connect your wallet'}
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Select Wallet">
        <div className="space-y-4">
          <p className="font-semibold">{wallets.length === 0 && <h1>No wallets detected.</h1>}</p>
          {wallets.map(({ id, name, icon }) => (
            <div
              className="flex flex-row gap-2 items-center justify-start p-4 rounded-lg hover:bg-primary"
              key={id}
              onClick={() => {
                connect(id)
                setOpen(false)
              }}
            >
              <img src={icon} alt={`${name} icon`} className="w-8 h-8 mr-3" />
              <span>{name.replace(/^\w/, (c) => c.toUpperCase())}</span>
            </div>
          ))}
        </div>
      </Modal>
    </header>
  )
}
