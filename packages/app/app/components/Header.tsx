import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button'
import Modal from '~/components/Modal'
import Select from '~/components/Select'
import { useEnv } from '~/context/EnvContext'
import { useWallet } from '~/context/WalletContext'
import { ThemeToggle } from './ThemeToggle'
import { FiMenu, FiX } from 'react-icons/fi'

export const Header = () => {
  const [isOpen, setOpen] = useState(false)
  const { network, config } = useEnv()
  const { wallet, wallets, connect, detectWallets } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)

  // Navigation links data
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/djed', label: 'DJED' },
    { to: '/shen', label: 'SHEN' },
  ]

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `focus:outline-none transition-colors flex items-center p-2 ${
      isActive
        ? 'text-primary font-bold bg-primary/15 rounded-md border-b-0 hover:bg-primary/30'
        : 'hover:text-primary hover:border-primary'
    }`
  }

  useEffect(() => {
    if (isOpen) detectWallets()
  }, [isOpen])

  const toggleMenu = () => setMenuOpen((prev) => !prev)

  // Close the menu automatically on desktop (screen width greater than 1024px (lg))
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false) // Close the menu when screen size is large enough (desktop)
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
    <>
      {/* Navbar */}
      <header className="top-0 left-0 right-0 py-4 px-8 bg-white dark:bg-dark-bg shadow-sm dark:shadow-primary/30 z-50 ">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/">
              <div className="flex flex-row text-xl items-center">
                <img src="/reverse-djed.svg" alt="Reverse DJED" />
                Яeverse DJED
              </div>
            </Link>
          </div>

          {/* Center links - Desktop only */}
          <div className="hidden lg:flex justify-center space-x-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={getNavLinkClasses}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right - Wallet & Select */}
          <div className="flex-1 hidden lg:flex justify-end items-center space-x-4">
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
            <ThemeToggle />
            <Button onClick={() => setOpen(true)} className="w-48">
              {wallet ? `${wallet.address.slice(0, 10)}...` : 'Connect wallet'}
            </Button>
          </div>

          {/* Menu toggle - Mobile only */}
          <div className="flex flec-row space-x-4 lg:hidden text-primary">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="focus:outline-none p-2 hover:bg-gray-100 dark:hover:bg-primary/30 rounded-md transition-colors"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Slide-out Mobile Menu */}
      <div
        className={`fixed right-0 top-18 bottom-0 w-3/4 max-w-xs bg-white dark:bg-dark-bg z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={toggleMenu}
                className={(navData) => {
                  const baseClasses = getNavLinkClasses(navData)
                  return `${baseClasses} w-full justify-start font-medium border-b border-primary/20`
                }}
              >
                {link.label}
              </NavLink>
            ))}
            <Select
              defaultValue={network}
              size="full"
              onChange={(e) => {
                window.location.href = config[e.target.value]
              }}
              options={Object.keys(config).map((key) => ({
                value: key,
                label: key,
              }))}
            />
          </div>
          {/* Bottom content */}
          <div className="px-6 py-4">
            <Button onClick={() => setOpen(true)} className="w-full">
              {wallet ? `${wallet.address.slice(0, 10)}...` : 'Connect wallet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dark background*/}
      {menuOpen && <div className="fixed inset-0 bg-dark-bg/80 z-30" onClick={toggleMenu} />}

      {/* Wallet Modal */}
      <Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Select Wallet">
        <div className="space-y-4">
          <div>{wallets.length === 0 && <p className="font-semibold">No wallets detected.</p>}</div>
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
    </>
  )
}
