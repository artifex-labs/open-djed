import { TokenDetails } from '~/components/TokenDetails'
import { ReserveDetails } from '~/components/ReserveDetails'

export function meta() {
  return [{ title: 'Reverse DJED' }, { name: 'description', content: 'Welcome to reverse DJED!' }]
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full pt-8">
      <div className="flex flex-col">
        <div className="flex flex-row justify-center items-center gap-2">
          <h1 className="text-5xl font-bold">ЯEVERSE DJED</h1>
          <p className="text-lg text-primary">stablecoin</p>
        </div>
      </div>
      <div className="w-full max-w-5xl flex flex-col rounded-md p-4 items-center gap-6">
        <div className="flex flex-col sm:flex-row justify-center gap-10">
          <TokenDetails token="DJED" route="/djed" />
          <TokenDetails token="SHEN" route="/shen" />
        </div>

        <ReserveDetails />
      </div>
    </div>
  )
}
