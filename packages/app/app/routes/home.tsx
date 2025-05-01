import { useProtocolData } from '~/hooks/useProtocolData'
import { TokenDetails } from '~/components/TokenDetails'
import { ReserveDetails } from '~/components/ReserveDetails'
import type { Route } from './+types/home'

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Reverse DJED' }, { name: 'description', content: 'Welcome to reverse DJED!' }]
}

export default function Home() {
  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-5xl flex flex-col border-2 border-black rounded-md p-4 m-4">
        <div className="flex flex-wrap justify-center">
          <TokenDetails token="DJED" />
          <TokenDetails token="SHEN" />
        </div>

        <ReserveDetails />
      </div>
    </div>
  )
}
