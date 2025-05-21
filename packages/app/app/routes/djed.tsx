import { Actions } from '../components/Actions'

export function meta() {
  return [{ title: 'Reverse DJED - DJED' }, { name: 'description', content: 'Mint/burn DJED' }]
}

export default function DjedPage() {
  return <Actions token="DJED" />
}
