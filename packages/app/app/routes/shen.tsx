import { Actions } from '../components/Actions'

export function meta() {
  return [
    { title: 'SHEN Reservecoin | Mint & burn - Reverse DJED' },
    {
      name: 'description',
      content:
        'Mint and burn SHEN reservecoin on Cardano with our open-source platform. Transparent, free alternative to DJED.xyz for managing your SHEN holdings 24/7.',
    },
  ]
}

export default function ShenPage() {
  return <Actions token="SHEN" />
}
