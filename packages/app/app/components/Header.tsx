import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Modal from '~/components/Modal'
import { useEnv } from '~/context/EnvContext'
import { useWallet } from '~/context/WalletContext'

export const Header = () => {
  const [isOpen, setOpen] = useState(false)
  const { network, config } = useEnv()
  const { wallet, balance, wallets, connect, detectWallets } = useWallet()

  useEffect(() => {
    if (isOpen) detectWallets()
  }, [isOpen])

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
        {wallet ? `${balance} ADA` : 'Connect your wallet'}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Select Wallet">
        <div className="grid gap-4">
          {wallets.length === 0 && <p>No wallets detected.</p>}
          {wallets.map(({ id, name, icon }) => (
            <Button
              key={id}
              onClick={() => {
                connect(id)
                setOpen(false)
              }}
              className="flex items-center p-3 border rounded font-normal"
            >
              <img src={icon} alt={`${name} icon`} className="w-8 h-8 mr-3" />
              <span>{name}</span>
            </Button>
          ))}
        </div>
      </Modal>
    </header>
  )
}
