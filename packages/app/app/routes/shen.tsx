import { Actions } from '../components/Actions'

export function meta() {
  return [{ title: 'Reverse DJED - SHEN' }, { name: 'description', content: 'Mint/burn SHEn' }]
}

export default function ShenPage() {
  return <Actions token="SHEN" />
}
