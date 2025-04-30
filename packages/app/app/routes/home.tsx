import { useProtocolData } from '~/hooks/useProtocolData'
import { TokenDetails } from '~/components/TokenDetails'
import { ReserveDetails } from '~/components/ReserveDetails'
import type { Route } from './+types/home'

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Reverse DJED' }, { name: 'description', content: 'Welcome to reverse DJED!' }]
}

export default function Home() {
  const { isPending, error, data } = useProtocolData()

  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-5xl flex flex-col border-2 border-black rounded-md p-4 m-4">

        <div className="flex flex-wrap justify-center">
          <TokenDetails token="DJED" data={data} isPending={isPending} />
          <TokenDetails token="SHEN" data={data} isPending={isPending} />
        </div>

        <ReserveDetails data={data} isPending={isPending} />

      </div>
    </div>
  )
}
