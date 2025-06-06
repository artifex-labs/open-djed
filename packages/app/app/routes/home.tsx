import { TokenDetails } from '~/components/TokenDetails'
import { ReserveDetails } from '~/components/ReserveDetails'
import type { LoaderData } from '~/types/loader'
import { useLoaderData } from 'react-router'
import Modal from '~/components/Modal'
import { useEffect, useState } from 'react'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | The open-source alternative to DJED.xyz' },
    {
      name: 'description',
      content:
        "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.",
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance`,
    },
  ]
}

export default function Home() {
  const [hideInfoModal, setHideInfoModal] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedHome') === 'true'
    const dontShowAgain = localStorage.getItem('hideInfoModal') === 'true'

    setHideInfoModal(dontShowAgain)

    if (!hasVisitedThisSession && !dontShowAgain) {
      setOpenModal(true)
      sessionStorage.setItem('hasVisitedHome', 'true')
    }
  }, [])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked
    setHideInfoModal(value)
    localStorage.setItem('hideInfoModal', value.toString())
    if (value) setOpenModal(false)
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full pt-8 px-4 md:px-8">
      <div className="flex flex-col">
        <div className="flex flex-row justify-center items-center gap-2 flex-wrap">
          <h1 className="text-5xl font-bold text-center">OPEN DJED</h1>
          <p className="text-lg text-primary">stablecoin</p>
        </div>
      </div>
      <div className="w-full max-w-5xl flex flex-col rounded-md p-4 md:p-6 items-center gap-6">
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 sm:gap-8 w-full">
          <TokenDetails token="DJED" route="/djed" />
          <TokenDetails token="SHEN" route="/shen" />
        </div>
        <ReserveDetails />
      </div>

      {/* Info Modal */}
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title={`Welcome to Open DJED!`}>
        <div className="space-y-4 mt-4 text-lg leading-relaxed">
          <p>
            <strong>Open DJED</strong> is a transparent, community-driven implementation of the DJED
            algorithmic stablecoin protocol, designed to bring decentralized financial stability to the{' '}
            <strong>Cardano</strong> blockchain—without the barriers of proprietary code.
          </p>

          <p>
            Developed by <strong>Artifex Labs</strong>, Open DJED is the result of a deep reverse-engineering
            effort of the original DJED protocol. We’ve preserved the core mechanics and economic
            model—ensuring compatibility and reliability—while opening up the source code for the entire
            Cardano ecosystem to explore, audit, and improve.
          </p>

          <div className="space-y-2">
            <p className="font-semibold">
              <i className="fas fa-magnifying-glass text-primary mr-2"></i>
              Why Open DJED?
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>
                <i className="fas fa-brain text-primary mr-2"></i>
                <strong>Protocol-compatible</strong> – Same overcollateralized logic that powers DJED.
              </li>
              <li>
                <i className="fas fa-coins text-primary mr-2"></i>
                <strong>Lower network fees</strong> – Optimized contracts reduce fees by ~0.1 ADA.
              </li>
              <li>
                <i className="fas fa-receipt text-primary mr-2"></i>
                <strong>Transparent fees</strong> – Follows COTI’s structure with full on-chain visibility.
              </li>
              <li>
                <i className="fas fa-wrench text-primary mr-2"></i>
                <strong>Fully open source</strong> – All code is auditable, forkable, and community-owned.
              </li>
              <li>
                <i className="fas fa-seedling text-primary mr-2"></i>
                <strong>Community-first</strong> – Built for and by the Cardano ecosystem.
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">
              <i className="fas fa-compass text-primary mr-2"></i>
              Our Mission
            </p>
            <p>
              <strong>Artifex Labs</strong> is dedicated to building open-source, permissionless tools that
              strengthen the Cardano ecosystem. Open DJED is our first major release—and we’re just getting
              started!
            </p>
          </div>

          <p className="font-bold">
            Join us in reshaping DeFi on Cardano—openly, transparently, and together.
          </p>

          <div className="flex justify-end items-center mt-4">
            <input
              type="checkbox"
              id="hideInfoModal"
              className="mr-2"
              checked={hideInfoModal}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hideInfoModal" className="text-sm">
              Don’t show this again
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
