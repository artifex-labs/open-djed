import { useLoaderData } from 'react-router'
import { Actions } from '../components/Actions'
import type { LoaderData } from '~/types/loader'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | DJED Stablecoin - Mint & burn' },
    {
      name: 'description',
      content:
        'Mint and burn DJED stablecoin on Cardano with our open-source platform. Transparent, free alternative to DJED.xyz for managing your DJED holdings 24/7.',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance/djed`,
    },
  ]
}

export default function DjedPage() {
  return <Actions token="DJED" />
}
