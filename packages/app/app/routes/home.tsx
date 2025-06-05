import { TokenDetails } from '~/components/TokenDetails'
import { ReserveDetails } from '~/components/ReserveDetails'
import type { LoaderData } from '~/types/loader'
import { useLoaderData } from 'react-router'

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
    </div>
  )
}
