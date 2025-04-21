import type { WalletApi } from '@lucid-evolution/lucid';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router'
import Button from '~/components/Button';
import Modal from '~/components/Modal';

type WalletMetadata = {
  id: string;
  name: string;
  icon: string;
};

export const Header = () => {
  const [wallets, setWallets] = useState<WalletMetadata[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [walletApi, setWalletApi] = useState<WalletApi | null>(null);
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const detected = Object.keys(window.cardano || {}).map((id) => {
        const prov = window.cardano[id]!;
        return {
          id,
          name: prov.name,
          icon: prov.icon,
        };
      });
      setWallets(detected);
    }
  }, [isOpen]);

  const connect = async (id: string) => {
    try {
      const api = await window.cardano[id].enable();
      setWalletApi(api);
      setOpen(false);

      const balance = await api.getBalance();
      setBalance(balance);
    } catch (err) {
      console.error(`Failed to enable ${id}`, err);
    }
  };


  return (
    <header className="flex-column flex items-center justify-between py-4 px-4">
      <Link to="/">
        <div className="align-left text-xl flex flex-column">
          <img src="/reverse-djed.svg" alt="Reverse DJED" />
          Reverse DJED
        </div>
      </Link>
      <nav>
        <ul className="flex-column flex items-center justify-between">
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
      <Button onClick={() => setOpen(true)} className='w-48'>
        {walletApi ? `${balance}$` : "Connect your wallet"}
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
