import { Actions } from '../components/Actions'

export function meta() {
  return [
    { title: 'DJED Stablecoin | Mint & burn - Reverse DJED' },
    {
      name: 'description',
      content:
        'Mint and burn DJED stablecoin on Cardano with our open-source platform. Transparent, free alternative to DJED.xyz for managing your DJED holdings 24/7.',
    },
  ]
}

export default function DjedPage() {
  return <Actions token="DJED" />
}
